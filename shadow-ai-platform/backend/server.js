const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const { Sequelize, DataTypes } = require('sequelize');
const redis = require('redis');
const winston = require('winston');
const rateLimit = require('express-rate-limit');
const { createBullBoard } = require('@bull-board/api');
const { BullAdapter } = require('@bull-board/api/bullAdapter');
const { ExpressAdapter } = require('@bull-board/express');
const { Server } = require('socket.io');
const http = require('http');

// Load environment variables
require('dotenv').config();

// Initialize logger
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
    new winston.transports.File({ filename: 'logs/combined.log' }),
    new winston.transports.Console({
      format: winston.format.simple()
    })
  ]
});

// Initialize Express app
const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.CORS_ORIGIN || '*',
    methods: ['GET', 'POST']
  }
});

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use('/api/', limiter);

// Initialize database
const sequelize = new Sequelize(
  process.env.DB_NAME || 'sentinel_ai',
  process.env.DB_USER || 'postgres',
  process.env.DB_PASSWORD || 'password',
  {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    dialect: 'postgres',
    logging: process.env.NODE_ENV === 'development' ? console.log : false,
    pool: {
      max: 10,
      min: 0,
      acquire: 30000,
      idle: 10000
    }
  }
);

// Define models
const DetectionEvent = sequelize.define('DetectionEvent', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  type: {
    type: DataTypes.STRING,
    allowNull: false
  },
  tool: {
    type: DataTypes.STRING,
    allowNull: false
  },
  domain: {
    type: DataTypes.STRING,
    allowNull: false
  },
  url: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  riskLevel: {
    type: DataTypes.ENUM('low', 'medium', 'high'),
    defaultValue: 'medium'
  },
  detectionMethod: {
    type: DataTypes.STRING
  },
  details: {
    type: DataTypes.JSONB
  },
  userId: {
    type: DataTypes.UUID
  },
  organizationId: {
    type: DataTypes.UUID
  },
  processed: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  }
}, {
  indexes: [
    { fields: ['createdAt'] },
    { fields: ['riskLevel'] },
    { fields: ['organizationId'] },
    { fields: ['processed'] }
  ]
});

const Organization = sequelize.define('Organization', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  settings: {
    type: DataTypes.JSONB,
    defaultValue: {}
  },
  apiKey: {
    type: DataTypes.STRING,
    unique: true
  }
});

const Policy = sequelize.define('Policy', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT
  },
  rules: {
    type: DataTypes.JSONB,
    allowNull: false
  },
  actions: {
    type: DataTypes.JSONB,
    allowNull: false
  },
  enabled: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  }
});

// Initialize Redis
const redisClient = redis.createClient({
  url: process.env.REDIS_URL || 'redis://localhost:6379'
});

redisClient.on('error', (err) => {
  logger.error('Redis Client Error', err);
});

// Initialize Bull queues
const { Queue } = require('bull');
const eventQueue = new Queue('event-processing', {
  redis: process.env.REDIS_URL || 'redis://localhost:6379'
});

const alertQueue = new Queue('alert-processing', {
  redis: process.env.REDIS_URL || 'redis://localhost:6379'
});

// Bull Board for queue monitoring
const serverAdapter = new ExpressAdapter();
serverAdapter.setBasePath('/admin/queues');

createBullBoard({
  queues: [
    new BullAdapter(eventQueue),
    new BullAdapter(alertQueue)
  ],
  serverAdapter
});

app.use('/admin/queues', serverAdapter.getRouter());

// Socket.IO for real-time updates
io.on('connection', (socket) => {
  logger.info('New client connected:', socket.id);
  
  socket.on('subscribe', (organizationId) => {
    socket.join(`org:${organizationId}`);
    logger.info(`Client ${socket.id} subscribed to org:${organizationId}`);
  });
  
  socket.on('disconnect', () => {
    logger.info('Client disconnected:', socket.id);
  });
});

// Authentication middleware
const authenticate = async (req, res, next) => {
  const apiKey = req.headers['x-api-key'] || req.query.apiKey;
  
  if (!apiKey) {
    return res.status(401).json({ error: 'API key required' });
  }
  
  try {
    const organization = await Organization.findOne({ where: { apiKey } });
    
    if (!organization) {
      return res.status(401).json({ error: 'Invalid API key' });
    }
    
    req.organization = organization;
    next();
  } catch (error) {
    logger.error('Authentication error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Routes
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// Event ingestion endpoint
app.post('/api/events', authenticate, async (req, res) => {
  try {
    const eventData = req.body;
    const organization = req.organization;
    
    // Validate event data
    if (!eventData.type || !eventData.tool) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    
    // Create event in database
    const event = await DetectionEvent.create({
      ...eventData,
      organizationId: organization.id
    });
    
    // Add to processing queue
    await eventQueue.add('process-event', {
      eventId: event.id,
      organizationId: organization.id
    });
    
    // Emit real-time update
    io.to(`org:${organization.id}`).emit('new-event', event);
    
    // Update Redis cache for dashboard stats
    const statsKey = `stats:${organization.id}`;
    await redisClient.hIncrBy(statsKey, 'totalEvents', 1);
    await redisClient.hIncrBy(statsKey, `${event.riskLevel}RiskEvents`, 1);
    
    res.status(201).json({
      success: true,
      eventId: event.id
    });
  } catch (error) {
    logger.error('Error processing event:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get events for organization
app.get('/api/events', authenticate, async (req, res) => {
  try {
    const { limit = 50, offset = 0, riskLevel, startDate, endDate } = req.query;
    const organization = req.organization;
    
    const where = { organizationId: organization.id };
    
    if (riskLevel) {
      where.riskLevel = riskLevel;
    }
    
    if (startDate) {
      where.createdAt = {
        [Sequelize.Op.gte]: new Date(startDate)
      };
    }
    
    if (endDate) {
      where.createdAt = {
        ...where.createdAt,
        [Sequelize.Op.lte]: new Date(endDate)
      };
    }
    
    const events = await DetectionEvent.findAll({
      where,
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['createdAt', 'DESC']]
    });
    
    const total = await DetectionEvent.count({ where });
    
    res.json({
      events,
      pagination: {
        total,
        limit: parseInt(limit),
        offset: parseInt(offset),
        hasMore: total > parseInt(offset) + parseInt(limit)
      }
    });
  } catch (error) {
    logger.error('Error fetching events:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get dashboard statistics
app.get('/api/stats', authenticate, async (req, res) => {
  try {
    const organization = req.organization;
    const statsKey = `stats:${organization.id}`;
    
    // Try to get from cache first
    const cachedStats = await redisClient.hGetAll(statsKey);
    
    if (cachedStats && Object.keys(cachedStats).length > 0) {
      return res.json({
        source: 'cache',
        stats: cachedStats
      });
    }
    
    // Calculate from database
    const totalEvents = await DetectionEvent.count({
      where: { organizationId: organization.id }
    });
    
    const riskLevels = await DetectionEvent.findAll({
      attributes: [
        'riskLevel',
        [Sequelize.fn('COUNT', Sequelize.col('riskLevel')), 'count']
      ],
      where: { organizationId: organization.id },
      group: ['riskLevel']
    });
    
    const tools = await DetectionEvent.findAll({
      attributes: [
        'tool',
        [Sequelize.fn('COUNT', Sequelize.col('tool')), 'count']
      ],
      where: { organizationId: organization.id },
      group: ['tool'],
      order: [[Sequelize.fn('COUNT', Sequelize.col('tool')), 'DESC']],
      limit: 10
    });
    
    const stats = {
      totalEvents,
      riskLevels: riskLevels.reduce((acc, curr) => {
        acc[curr.riskLevel] = parseInt(curr.dataValues.count);
        return acc;
      }, { low: 0, medium: 0, high: 0 }),
      topTools: tools.map(t => ({
        tool: t.tool,
        count: parseInt(t.dataValues.count)
      }))
    };
    
    // Cache for 5 minutes
    await redisClient.hSet(statsKey, stats);
    await redisClient.expire(statsKey, 300);
    
    res.json({
      source: 'database',
      stats
    });
  } catch (error) {
    logger.error('Error fetching stats:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Policy management
app.get('/api/policies', authenticate, async (req, res) => {
  try {
    const organization = req.organization;
    const policies = await Policy.findAll({
      where: { organizationId: organization.id }
    });
    
    res.json({ policies });
  } catch (error) {
    logger.error('Error fetching policies:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/policies', authenticate, async (req, res) => {
  try {
    const organization = req.organization;
    const policyData = req.body;
    
    const policy = await Policy.create({
      ...policyData,
      organizationId: organization.id
    });
    
    res.status(201).json({ policy });
  } catch (error) {
    logger.error('Error creating policy:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Initialize database and start server
async function startServer() {
  try {
    // Connect to database
    await sequelize.authenticate();
    logger.info('Database connection established');
    
    // Sync database (use force: true only in development)
    await sequelize.sync({ force: process.env.NODE_ENV === 'development' });
    logger.info('Database synchronized');
    
    // Connect to Redis
    await redisClient.connect();
    logger.info('Redis connected');
    
    // Start server
    const PORT = process.env.PORT || 3000;
    server.listen(PORT, () => {
      logger.info(`Server running on port ${PORT}`);
      logger.info(`Bull Board available at http://localhost:${PORT}/admin/queues`);
    });
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
}

// Queue processors
eventQueue.process('process-event', async (job) => {
  const { eventId, organizationId } = job.data;
  
  try {
    const event = await DetectionEvent.findByPk(eventId);
    
    if (!event) {
      throw new Error(`Event ${eventId} not found`);
    }
    
    // Apply organization policies
    const policies = await Policy.findAll({
      where: {
        organizationId,
        enabled: true
      }
    });
    
    for (const policy of policies) {
      if (evaluatePolicy(policy.rules, event)) {
        await executePolicyActions(policy.actions, event);
        
        // Add to alert queue if needed
        if (policy.actions.alert) {
          await alertQueue.add('send-alert', {
            eventId: event.id,
            policyId: policy.id,
            organizationId
          });
        }
      }
    }
    
    // Mark as processed
    await event.update({ processed: true });
    
    logger.info(`Processed event ${eventId}`);
  } catch (error) {
    logger.error(`Error processing event ${eventId}:`, error);
    throw error;
  }
});

alertQueue.process('send-alert', async (job) => {
  const { eventId, policyId, organizationId } = job.data;
  
  try {
    const event = await DetectionEvent.findByPk(eventId);
    const policy = await Policy.findByPk(policyId);
    const organization = await Organization.findByPk(organizationId);
    
    if (!event || !policy || !organization) {
      throw new Error('Missing data for alert');
    }
    
    // Send alert based on organization settings
    await sendAlert(organization, policy, event);
    
    logger.info(`Sent alert for event ${eventId}`);
  } catch (error) {
    logger.error(`Error sending alert for event ${eventId}:`, error);
    throw error;
  }
});

// Helper functions
function evaluatePolicy(rules, event) {
  // Simple rule evaluation - in production, use a rules engine
  for (const rule of rules) {
    switch (rule.field) {
      case 'riskLevel':
        if (rule.operator === 'equals' && event.riskLevel === rule.value) {
          return true;
        }
        if (rule.operator === 'greaterThan') {
          const riskLevels = { low: 1, medium: 2, high: 3 };
          if (riskLevels[event.riskLevel] > riskLevels[rule.value]) {
            return true;
          }
        }
        break;
      case 'tool':
        if (rule.operator === 'equals' && event.tool === rule.value) {
          return true;
        }
        if (rule.operator === 'contains' && event.tool.includes(rule.value)) {
          return true;
        }
        break;
    }
  }
  
  return false;
}

async function executePolicyActions(actions, event) {
  // Execute policy actions
  if (actions.block) {
    // Block the tool/domain
    logger.info(`Blocking ${event.tool} on ${event.domain}`);
  }
  
  if (actions.notify) {
    // Send notification
    logger.info(`Notifying about ${event.tool} detection`);
  }
  
  if (actions.quarantine) {
    // Quarantine data
    logger.info(`Quarantining data from ${event.tool}`);
  }
}

async function sendAlert(organization, policy, event) {
  // Send alert via configured channels
  const settings = organization.settings || {};
  
  if (settings.emailAlerts) {
    // Send email alert
    logger.info(`Sending email alert for ${event.tool}`);
  }
  
  if (settings.slackWebhook) {
    // Send Slack alert
    logger.info(`Sending Slack alert for ${event.tool}`);
  }
  
  // Real-time socket notification
  io.to(`org:${organization.id}`).emit('alert', {
    policy: policy.name,
    event: {
      tool: event.tool,
      riskLevel: event.riskLevel,
      timestamp: event.createdAt
    }
  });
}

// Handle graceful shutdown
process.on('SIGTERM', async () => {
  logger.info('SIGTERM received, shutting down gracefully');
  
  await sequelize.close();
  await redisClient.quit();
  await eventQueue.close();
  await alertQueue.close();
  
  server.close(() => {
    logger.info('Server closed');
    process.exit(0);
  });
});

// Start the server
startServer();

module.exports = { app, server, sequelize, redisClient };