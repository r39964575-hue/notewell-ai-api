// OpenClaw API Server for NoteWell AI
// This runs alongside your OpenClaw Gateway and handles API requests from Bubble

const express = require('express');
const cors = require('cors');
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors()); // Allow requests from Bubble
app.use(express.json());

// Simple in-memory store for templates (in production, use a database)
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
  },
  'trauma': {
    name: 'Trauma-Informed Therapy',
    prompt: `You are a clinical AI assistant helping a therapist write a DAP note for Trauma-Informed Therapy.

SESSION SUMMARY:
{summary}

Generate a DAP note (Data, Assessment, Plan) with trauma-informed language...`
  },
  'nutrition': {
    name: 'Nutrition Coaching',
    prompt: `You are a clinical AI assistant helping a nutritionist write a SOAP note.

SESSION SUMMARY:
{summary}

Generate a nutrition-focused SOAP note...`
  }
};

// Cost tracking (in production, use a database)
const costTracker = {
  totalNotes: 0,
  totalCost: 0,
  costPerNote: 0.001 // $0.001 per note with DeepSeek
};

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    service: 'NoteWell AI API',
    version: '1.0.0',
    openclaw: 'connected',
    uptime: process.uptime()
  });
});

// Generate note endpoint
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
    
    console.log(`Generating ${specialty} note...`);
    console.log(`Summary length: ${summary.length} chars`);
    
    // Get template
    const template = templates[specialty];
    let prompt = template.prompt
      .replace('{summary}', summary)
      .replace('{pronouns}', client_pronouns)
      .replace('{duration}', session_duration)
      .replace('{therapist}', therapist_name);
    
    // For demo purposes, we'll simulate OpenClaw response
    // In production, you would call OpenClaw Gateway API
    
    const simulatedNote = generateSimulatedNote(summary, specialty, client_pronouns, session_duration);
    
    // Track costs
    costTracker.totalNotes++;
    costTracker.totalCost += costTracker.costPerNote;
    
    // Return success
    res.json({
      success: true,
      note: simulatedNote,
      metadata: {
        specialty: specialty,
        template: template.name,
        generated_at: new Date().toISOString(),
        cost: costTracker.costPerNote,
        summary_length: summary.length,
        note_length: simulatedNote.length
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

// Get available templates
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

// Get usage stats
app.get('/api/stats', (req, res) => {
  res.json({
    success: true,
    stats: {
      total_notes_generated: costTracker.totalNotes,
      total_cost: `$${costTracker.totalCost.toFixed(3)}`,
      cost_per_note: `$${costTracker.costPerNote}`,
      estimated_monthly_cost: `$${(costTracker.totalCost * 30).toFixed(2)}`,
      savings_vs_claude: `$${(costTracker.totalNotes * 0.009).toFixed(3)}` // $0.01 - $0.001 = $0.009 savings per note
    }
  });
});

// Helper function to simulate note generation (for demo)
function generateSimulatedNote(summary, specialty, pronouns, duration) {
  const date = new Date().toLocaleDateString();
  
  return `**SUBJECTIVE:**
Client reported ${summary.toLowerCase().includes('anxiety') ? 'elevated anxiety symptoms' : 'concerns'} this week. ${pronouns === 'they/them' ? 'They' : pronouns === 'he/him' ? 'He' : 'She'} described ${summary.substring(0, 100)}... Completed partial homework from previous session.

**OBJECTIVE:**
Client presented with ${summary.toLowerCase().includes('engaged') ? 'good engagement' : 'typical affect'} during the ${duration}-minute session. ${specialty === 'cbt' ? 'Identified cognitive distortions related to presented concerns.' : 'Discussed relevant therapeutic concepts.'} No assessment tools administered this session.

**ASSESSMENT:**
Client continues to experience ${summary.toLowerCase().includes('improve') ? 'improving symptoms' : 'ongoing concerns'}. Demonstrates ${summary.toLowerCase().includes('struggle') ? 'some difficulty' : 'good progress'} with applying techniques. Risk assessment: No SI/HI reported.

**PLAN:**
1. Homework: ${summary.toLowerCase().includes('homework') ? 'As discussed in session' : 'Practice techniques discussed'}.
2. Next session: Continue ${specialty === 'cbt' ? 'cognitive restructuring work' : 'therapeutic process'}.
3. Focus: ${summary.substring(0, 80)}...
4. Follow-up in 1 week.

**NOTES:**
Session focused on ${specialty} techniques. Client expressed ${summary.toLowerCase().includes('motivated') ? 'motivation to continue' : 'willingness to engage'} in therapeutic process.`;

}

// Start server
app.listen(PORT, () => {
  console.log(`NoteWell AI API server running on port ${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/api/health`);
  console.log(`Generate note: POST http://localhost:${PORT}/api/generate-note`);
  console.log(`Available templates: GET http://localhost:${PORT}/api/templates`);
  console.log(`\n=== Configuration for Bubble ===`);
  console.log(`API Base URL: http://localhost:${PORT}/api`);
  console.log(`Generate Note Endpoint: /generate-note`);
  console.log(`Method: POST`);
  console.log(`Content-Type: application/json`);
  console.log(`\nSample request body:`);
  console.log(JSON.stringify({
    summary: "Client discussed anxiety about work presentations...",
    specialty: "cbt",
    client_pronouns: "they/them",
    session_duration: "50",
    therapist_name: "Dr. Smith"
  }, null, 2));
});

// Instructions for running with OpenClaw
console.log(`\n=== To Run With Actual OpenClaw ===`);
console.log(`1. Install dependencies: npm install express cors`);
console.log(`2. Start OpenClaw Gateway: openclaw gateway start`);
console.log(`3. Run this server: node openclaw-api-server.js`);
console.log(`4. Update the generateSimulatedNote function to call OpenClaw API`);
console.log(`\n=== OpenClaw API Call Example ===`);
console.log(`
// Replace generateSimulatedNote with:
async function generateNoteWithOpenClaw(prompt) {
  const response = await fetch('http://localhost:3001/api/complete', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: 'custom-api-deepseek-com/deepseek-chat',
      prompt: prompt,
      temperature: 0.3,
      max_tokens: 1000
    })
  });
  
  const data = await response.json();
  return data.text || data.choices[0].text;
}
`);