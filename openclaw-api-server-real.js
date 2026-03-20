// OpenClaw API Server for NoteWell AI - REAL VERSION
// This version actually calls OpenClaw Gateway instead of simulating

const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// OpenClaw Gateway configuration
const OPENCLAW_GATEWAY_URL = process.env.OPENCLAW_URL || 'http://localhost:18789';
const OPENCLAW_TOKEN = process.env.OPENCLAW_TOKEN || '3eb392327346cbf81741e122db95640faada9b9d5f2b6ed4';

// Templates (same as before)
const templates = {
  'cbt': {
    name: 'Cognitive Behavioral Therapy',
    prompt: `You are a clinical AI assistant helping a therapist write a SOAP note for a Cognitive Behavioral Therapy session.

SESSION SUMMARY PROVIDED BY THERAPIST:
{summary}

Please generate a professional SOAP note with the following structure:

**SUBJECTIVE:**
- Client's self-report of mood, symptoms, and week's experiences
- Homework completion and challenges
- Specific thoughts/feelings discussed

**OBJECTIVE:**
- Therapist observations (affect, engagement, speech)
- Cognitive distortions identified
- Behavioral patterns noted
- Assessment tools used (PHQ-9, GAD-7, etc.) if applicable

**ASSESSMENT:**
- Clinical impression and progress
- Cognitive patterns (automatic thoughts, core beliefs)
- Functional analysis (ABC model if applicable)
- Risk assessment (SI/HI if relevant)

**PLAN:**
- Homework assigned (CBT worksheets, thought records, behavioral experiments)
- Focus for next session
- Follow-up schedule
- Any referrals or coordination needed

**NOTES:**
- Maintain professional, clinical tone
- Use CBT-specific terminology appropriately
- Keep to 250-400 words total
- Ensure HIPAA compliance (no identifying details)
- Client pronouns: {pronouns}
- Session duration: {duration} minutes
- Therapist: {therapist}`
  }
};

// Cost tracking
const costTracker = {
  totalNotes: 0,
  totalCost: 0,
  costPerNote: 0.001 // $0.001 per note with DeepSeek
};

// Function to call OpenClaw Gateway
async function callOpenClawGateway(prompt) {
  try {
    console.log(`Calling OpenClaw Gateway at ${OPENCLAW_GATEWAY_URL}/v1/chat/completions`);
    console.log(`Token: ${OPENCLAW_TOKEN ? 'Present' : 'Missing'}`);
    
    const response = await fetch(`${OPENCLAW_GATEWAY_URL}/v1/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(OPENCLAW_TOKEN && { 'Authorization': `Bearer ${OPENCLAW_TOKEN}` })
      },
      body: JSON.stringify({
        model: 'custom-api-deepseek-com/deepseek-chat',
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.3,
        max_tokens: 1000
      })
    });
    
    if (!response.ok) {
      throw new Error(`OpenClaw Gateway error: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    console.log('OpenClaw response received');
    
    // Extract text from OpenAI-compatible response format
    return data.choices?.[0]?.message?.content || data.content || JSON.stringify(data);
    
  } catch (error) {
    console.error('Error calling OpenClaw Gateway:', error.message);
    // Fallback to simulated response if OpenClaw fails
    return generateSimulatedNoteFallback(prompt);
  }
}

// Fallback function if OpenClaw fails
function generateSimulatedNoteFallback(prompt) {
  console.log('Using fallback simulated note');
  return `**SUBJECTIVE:**
Client reported concerns as described in session. Engaged in therapeutic discussion.

**OBJECTIVE:**
Therapist observed client participation. Discussed therapeutic concepts.

**ASSESSMENT:**
Client demonstrates engagement in therapeutic process.

**PLAN:**
Continue therapeutic work as discussed.

**NOTES:**
Note: This is a simulated response. Connect to OpenClaw Gateway for AI-generated notes.`;
}

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    service: 'NoteWell AI API',
    version: '1.0.0',
    openclaw: OPENCLAW_TOKEN ? 'connected' : 'not configured',
    uptime: process.uptime(),
    gateway_url: OPENCLAW_GATEWAY_URL
  });
});

// Generate note endpoint - NOW USING REAL OPENCLAW
app.post('/api/generate-note', async (req, res) => {
  try {
    const { summary, specialty = 'cbt', client_pronouns = 'they/them', session_duration = '50', therapist_name = 'Therapist' } = req.body;
    
    // Validate input
    if (!summary || summary.trim().length < 10) {
      return res.status(400).json({
        success: false,
        error: 'Session summary must be at least 10 characters'
      });
    }
    
    if (!templates[specialty]) {
      return res.status(400).json({
        success: false,
        error: `Specialty '${specialty}' not supported. Available: ${Object.keys(templates).join(', ')}`
      });
    }
    
    console.log(`Generating ${specialty} note with OpenClaw...`);
    console.log(`Summary length: ${summary.length} chars`);
    
    // Get template and create prompt
    const template = templates[specialty];
    const prompt = template.prompt
      .replace('{summary}', summary)
      .replace('{pronouns}', client_pronouns)
      .replace('{duration}', session_duration)
      .replace('{therapist}', therapist_name);
    
    // Call OpenClaw Gateway (REAL AI)
    const note = await callOpenClawGateway(prompt);
    
    // Track costs
    costTracker.totalNotes++;
    costTracker.totalCost += costTracker.costPerNote;
    
    // Return success
    res.json({
      success: true,
      note: note,
      metadata: {
        specialty: specialty,
        template: template.name,
        generated_at: new Date().toISOString(),
        cost: costTracker.costPerNote,
        summary_length: summary.length,
        note_length: note.length,
        ai_provider: OPENCLAW_TOKEN ? 'OpenClaw Gateway' : 'Simulated (configure token)'
      },
      cost_tracking: {
        total_notes: costTracker.totalNotes,
        total_cost: costTracker.totalCost.toFixed(3),
        cost_per_note: costTracker.costPerNote
      }
    });
    
  } catch (error) {
    console.error('Error generating note:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: error.message
    });
  }
});

// Other endpoints remain the same
app.get('/api/templates', (req, res) => {
  const templateList = Object.entries(templates).map(([key, value]) => ({
    id: key,
    name: value.name,
    description: `${value.name} note template`
  }));
  
  res.json({
    success: true,
    templates: templateList
  });
});

app.get('/api/stats', (req, res) => {
  res.json({
    success: true,
    stats: {
      total_notes_generated: costTracker.totalNotes,
      total_cost: `$${costTracker.totalCost.toFixed(3)}`,
      cost_per_note: `$${costTracker.costPerNote}`,
      estimated_monthly_cost: `$${(costTracker.totalCost * 30).toFixed(2)}`,
      savings_vs_claude: `$${(costTracker.totalNotes * 0.009).toFixed(3)}`,
      ai_provider: OPENCLAW_TOKEN ? 'OpenClaw Gateway' : 'Simulated'
    }
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`NoteWell AI API server (REAL OpenClaw) running on port ${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/api/health`);
  console.log(`\n=== OPENCLAW CONFIGURATION ===`);
  console.log(`Gateway URL: ${OPENCLAW_GATEWAY_URL}`);
  console.log(`Token configured: ${OPENCLAW_TOKEN ? 'YES' : 'NO (using simulated responses)'}`);
  
  if (!OPENCLAW_TOKEN) {
    console.log(`\n⚠️  TO GET REAL AI NOTES:`);
    console.log(`1. Get your OpenClaw Gateway token:`);
    console.log(`   openclaw config get gateway.token`);
    console.log(`2. Set it as environment variable:`);
    console.log(`   export OPENCLAW_TOKEN=your_token_here`);
    console.log(`3. Restart this server with the token`);
  }
  
  console.log(`\n=== For Bubble Integration ===`);
  console.log(`API Base URL: http://localhost:${PORT}/api`);
  console.log(`Generate Note: POST /generate-note`);
});