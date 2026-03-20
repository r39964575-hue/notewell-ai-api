stdDev);
        if (shortIntervals.length > 3) {
          anomalies.push({
            type: 'rapid_ai_usage',
            description: 'Unusually rapid AI tool usage detected',
            severity: 'low'
          });
        }
      }
    }
    
    // Check for data volume anomalies
    if (behaviorData.dataVolume) {
      const avgVolume = behaviorData.dataVolume.average || 0;
      const currentVolume = behaviorData.dataVolume.current || 0;
      
      if (currentVolume > avgVolume * 3) {
        anomalies.push({
          type: 'high_data_volume',
          description: `Data volume (${currentVolume} bytes) significantly above average (${avgVolume} bytes)`,
          severity: 'high'
        });
      }
    }
    
    return anomalies;
  }

  // Helper methods
  mapKeywordToTool(keyword) {
    const mapping = {
      'chatgpt': 'ChatGPT',
      'gpt-': 'OpenAI API',
      'claude': 'Claude',
      'bard': 'Google Bard',
      'gemini': 'Google Gemini',
      'copilot': 'GitHub Copilot',
      'midjourney': 'Midjourney',
      'dall-e': 'DALL-E',
      'stable diffusion': 'Stable Diffusion'
    };
    
    for (const [key, tool] of Object.entries(mapping)) {
      if (keyword.toLowerCase().includes(key.toLowerCase())) {
        return tool;
      }
    }
    
    return 'Unknown AI Tool';
  }

  mapProviderToTool(provider) {
    const mapping = {
      'openai': 'OpenAI API',
      'anthropic': 'Claude API',
      'google': 'Google AI',
      'cohere': 'Cohere API',
      'huggingface': 'Hugging Face'
    };
    
    return mapping[provider] || provider;
  }

  mapDomainToTool(domain) {
    const mapping = {
      'openai.com': 'OpenAI',
      'chat.openai.com': 'ChatGPT',
      'anthropic.com': 'Anthropic',
      'claude.ai': 'Claude',
      'google.com': 'Google',
      'bard.google.com': 'Google Bard',
      'github.com': 'GitHub',
      'copilot.github.com': 'GitHub Copilot',
      'midjourney.com': 'Midjourney'
    };
    
    for (const [key, tool] of Object.entries(mapping)) {
      if (domain.includes(key)) {
        return tool;
      }
    }
    
    return 'AI Tool';
  }

  isAIToolDomain(domain) {
    const aiDomains = [
      'openai.com',
      'anthropic.com',
      'claude.ai',
      'google.com/ai',
      'github.com/copilot',
      'midjourney.com',
      'stability.ai',
      'cohere.com',
      'huggingface.co'
    ];
    
    return aiDomains.some(aiDomain => domain.includes(aiDomain));
  }

  extractContext(text, keyword, contextLength = 50) {
    const index = text.toLowerCase().indexOf(keyword.toLowerCase());
    if (index === -1) return '';
    
    const start = Math.max(0, index - contextLength);
    const end = Math.min(text.length, index + keyword.length + contextLength);
    
    let context = text.substring(start, end);
    if (start > 0) context = '...' + context;
    if (end < text.length) context = context + '...';
    
    return context;
  }

  getDataRiskLevel(category, type) {
    const riskLevels = {
      'pii.ssn': 'high',
      'pii.creditCard': 'high',
      'pii.email': 'medium',
      'pii.phone': 'medium',
      'pii.address': 'low',
      'secrets.apiKey': 'critical',
      'secrets.password': 'critical',
      'secrets.token': 'high',
      'secrets.secret': 'high',
      'ip.ipv4': 'low',
      'ip.ipv6': 'low'
    };
    
    return riskLevels[`${category}.${type}`] || 'medium';
  }

  getDataRiskScore(category, type) {
    const riskScores = {
      'critical': 20,
      'high': 15,
      'medium': 10,
      'low': 5
    };
    
    const riskLevel = this.getDataRiskLevel(category, type);
    return riskScores[riskLevel] || 10;
  }

  getRiskLevel(score) {
    if (score >= 70) return 'high';
    if (score >= 40) return 'medium';
    return 'low';
  }

  // Public API methods
  async detect(content, options = {}) {
    const cacheKey = `detection:${this.hashContent(content)}`;
    
    // Check cache first
    if (options.useCache !== false) {
      const cached = await redisClient.get(cacheKey);
      if (cached) {
        logger.debug('Returning cached detection result');
        return JSON.parse(cached);
      }
    }
    
    // Perform detection
    const analysis = await this.analyzeContent({ text: content });
    
    // Cache result
    if (options.cache !== false) {
      await redisClient.set(cacheKey, JSON.stringify(analysis), {
        EX: options.cacheTtl || 300 // 5 minutes default
      });
    }
    
    return analysis;
  }

  async detectBatch(contents, options = {}) {
    const results = [];
    
    for (const content of contents) {
      const result = await this.detect(content, options);
      results.push(result);
    }
    
    return results;
  }

  async queueDetection(data) {
    const job = await detectionQueue.add('analyze-event', {
      data,
      timestamp: new Date().toISOString()
    });
    
    return job.id;
  }

  hashContent(content) {
    // Simple hash for caching
    let hash = 0;
    for (let i = 0; i < content.length; i++) {
      const char = content.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return hash.toString(36);
  }

  // Statistics and monitoring
  async getStats() {
    const stats = {
      queue: await detectionQueue.getJobCounts(),
      cache: {
        size: await redisClient.dbSize(),
        hits: await redisClient.get('cache:hits') || 0,
        misses: await redisClient.get('cache:misses') || 0
      },
      models: {
        loaded: Object.keys(this.models).length,
        training: await this.getModelTrainingStatus()
      }
    };
    
    return stats;
  }

  async getModelTrainingStatus() {
    // Check if models need retraining
    const lastTraining = await redisClient.get('model:last_training');
    const trainingCount = await redisClient.get('model:training_count') || 0;
    
    return {
      lastTraining,
      trainingCount: parseInt(trainingCount),
      needsRetraining: !lastTraining || (Date.now() - new Date(lastTraining).getTime() > 7 * 24 * 60 * 60 * 1000) // 7 days
    };
  }
}

// Export singleton instance
const detectionEngine = new DetectionEngine();

module.exports = {
  DetectionEngine,
  detectionEngine,
  AI_TOOL_PATTERNS,
  SENSITIVE_DATA_PATTERNS
};