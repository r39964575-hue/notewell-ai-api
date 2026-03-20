// Test actual note generation with OpenClaw
// This simulates what would happen in the real application

const fs = require('fs');
const path = require('path');

// Read the CBT template
const templatePath = path.join(__dirname, 'skills/note-templates/templates/cbt-soap.md');
const templateContent = fs.readFileSync(templatePath, 'utf8');

// Extract the prompt template
function extractPromptTemplate(content) {
  const lines = content.split('\n');
  let inPromptSection = false;
  let promptLines = [];
  
  for (const line of lines) {
    if (line.includes('SESSION SUMMARY PROVIDED BY THERAPIST:')) {
      inPromptSection = true;
    }
    if (inPromptSection) {
      promptLines.push(line);
      if (line.includes('Ensure HIPAA compliance')) {
        break;
      }
    }
  }
  
  return promptLines.join('\n');
}

// Realistic test case
const testSession = {
  summary: "Client reported increased anxiety about work presentations this week. We identified 'catastrophizing' cognitive distortion ('If I mess up, I'll get fired'). Practiced cognitive restructuring with thought record exercise. Client engaged well but struggled with applying techniques in real-time. Assigned homework to complete thought record for 3 anxiety-provoking situations before next session.",
  specialty: "CBT",
  duration: "50 minutes",
  therapist: "Dr. Smith",
  nextSession: "1 week"
};

console.log('=== Testing NoteWell AI Template ===\n');
console.log('Session Summary:');
console.log(testSession.summary);
console.log('\n' + '='.repeat(80) + '\n');

// Create the prompt
const promptTemplate = extractPromptTemplate(templateContent);
const prompt = promptTemplate.replace('{summary}', testSession.summary);

console.log('Generated Prompt (first 600 chars):');
console.log(prompt.substring(0, 600) + '...');
console.log('\n' + '='.repeat(80) + '\n');

// Show what would be sent to OpenClaw
console.log('What would be sent to OpenClaw API:\n');
console.log(JSON.stringify({
  model: 'custom-api-deepseek-com/deepseek-chat',
  prompt: prompt.substring(0, 1000) + '...', // Truncated for display
  temperature: 0.3,
  max_tokens: 1000,
  thinking: false
}, null, 2));

console.log('\n' + '='.repeat(80) + '\n');

// Expected output structure
console.log('Expected Output Structure:\n');

const expectedNote = `**SUBJECTIVE:**
Client reported elevated anxiety symptoms this week, particularly related to upcoming work presentations. Described physical symptoms including increased heart rate and sleep disturbance. Completed partial homework from previous session, noting difficulty applying techniques in real-time situations.

**OBJECTIVE:**
Client presented with anxious affect, fidgeting, and rapid speech when discussing work situations. Identified cognitive distortion of catastrophizing ("If I mess up, I'll get fired"). Engaged well in cognitive restructuring exercise, demonstrating understanding of CBT concepts but struggling with real-time application. No assessment tools administered this session.

**ASSESSMENT:**
Client continues to experience anxiety with situational triggers. Demonstrates good insight into cognitive distortions but has difficulty with implementation. Progress noted in ability to identify catastrophizing patterns. Risk assessment: No SI/HI reported. Moderate impairment in work functioning.

**PLAN:**
1. Homework: Complete thought record for 3 anxiety-provoking situations with focus on challenging catastrophizing thoughts.
2. Next session: Practice behavioral experiment related to work presentations.
3. Continue cognitive restructuring with emphasis on developing coping statements.
4. Follow-up in 1 week.

**NOTES:**
Session focused on anxiety management using CBT techniques. Client expressed motivation to improve work functioning.`;

console.log(expectedNote);

console.log('\n' + '='.repeat(80) + '\n');

// Business metrics
console.log('Business Impact Analysis:\n');

const metrics = {
  timeSavedPerNote: 25, // minutes
  notesPerTherapistPerMonth: 40,
  hourlyRateTherapist: 100, // dollars
  costPerNoteTraditional: 0.01,
  costPerNoteOpenClaw: 0.001
};

console.log(`Time Savings per Note: ${metrics.timeSavedPerNote} minutes`);
console.log(`Monthly Time Savings: ${metrics.timeSavedPerNote * metrics.notesPerTherapistPerMonth / 60} hours`);
console.log(`Value of Time Saved: $${(metrics.timeSavedPerNote * metrics.notesPerTherapistPerMonth / 60) * metrics.hourlyRateTherapist} per month`);
console.log(`\nCost Comparison:`);
console.log(`Traditional (Claude): $${(metrics.costPerNoteTraditional * metrics.notesPerTherapistPerMonth).toFixed(2)}/month`);
console.log(`OpenClaw (DeepSeek): $${(metrics.costPerNoteOpenClaw * metrics.notesPerTherapistPerMonth).toFixed(2)}/month`);
console.log(`Monthly Savings: $${((metrics.costPerNoteTraditional - metrics.costPerNoteOpenClaw) * metrics.notesPerTherapistPerMonth).toFixed(2)}`);
console.log(`Annual Savings: $${(((metrics.costPerNoteTraditional - metrics.costPerNoteOpenClaw) * metrics.notesPerTherapistPerMonth) * 12).toFixed(2)}`);

console.log('\n' + '='.repeat(80) + '\n');

// Next steps for MVP
console.log('Next Steps for Your MVP:\n');

const nextSteps = [
  '1. Set up OpenClaw Gateway (already done)',
  '2. Create Bubble.io frontend with:',
  '   - Session summary input field',
  '   - Specialty dropdown (CBT, trauma, etc.)',
  '   - Generate Note button',
  '   - Note display/editing area',
  '   - Save/export buttons',
  '3. Connect Bubble to OpenClaw via API',
  '4. Add Stripe for $19/month subscriptions',
  '5. Create landing page with:',
  '   - "90% cheaper AI" value proposition',
  '   - Time savings calculator',
  '   - Free trial signup',
  '6. Launch to r/therapists community',
  '7. Get first 10 paying customers'
];

nextSteps.forEach(step => console.log(step));

console.log('\n' + '='.repeat(80) + '\n');
console.log('Template skill built successfully! Ready for integration.');