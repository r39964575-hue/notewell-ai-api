// Test script for CBT SOAP note generation
// This demonstrates how the template would work with OpenClaw

const fs = require('fs');
const path = require('path');

// Read the CBT template
const templatePath = path.join(__dirname, 'templates/cbt-soap.md');
const templateContent = fs.readFileSync(templatePath, 'utf8');

// Extract the prompt template from the markdown file
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

// Example session summaries for testing
const testSummaries = [
  {
    id: 1,
    summary: "Client discussed social anxiety about upcoming party. Identified 'mind reading' distortion (thinking others will judge them). Practiced behavioral experiment planning. Homework: attend party for 30 minutes and observe actual reactions.",
    specialty: "CBT",
    duration: "45 minutes"
  },
  {
    id: 2, 
    summary: "Client reported depressed mood for past week. We explored connection between negative automatic thoughts ('I'm worthless') and decreased activity. Used activity scheduling to increase pleasant events. Assigned mood monitoring and activity log.",
    specialty: "CBT for Depression",
    duration: "50 minutes"
  },
  {
    id: 3,
    summary: "OCD client discussed contamination fears. Exposure hierarchy created for touching 'contaminated' objects. Completed in-session exposure to doorknob. Homework: touch 3 'moderately contaminated' items daily.",
    specialty: "CBT for OCD",
    duration: "60 minutes"
  }
];

// Generate prompts for each test case
console.log('=== CBT SOAP Note Template Test ===\n');

testSummaries.forEach((test, index) => {
  console.log(`Test Case ${index + 1}: ${test.specialty}`);
  console.log(`Session Summary: ${test.summary}`);
  console.log('\n--- Generated Prompt ---');
  
  const promptTemplate = extractPromptTemplate(templateContent);
  const filledPrompt = promptTemplate.replace('{summary}', test.summary);
  
  console.log(filledPrompt.substring(0, 500) + '...\n');
  console.log('--- Expected Output Structure ---');
  console.log('1. SUBJECTIVE section with client report');
  console.log('2. OBJECTIVE section with therapist observations');
  console.log('3. ASSESSMENT with clinical impression');
  console.log('4. PLAN with homework and follow-up');
  console.log('5. Professional, clinical tone (250-400 words)\n');
  console.log('='.repeat(50) + '\n');
});

// Show how to integrate with OpenClaw
console.log('=== OpenClaw Integration Example ===\n');

const integrationExample = `
// How to use this template with OpenClaw:

const openclaw = require('openclaw-sdk'); // Hypothetical SDK

async function generateCBTNote(sessionSummary, therapistPreferences = {}) {
  // Load template
  const template = extractPromptTemplate(templateContent);
  
  // Customize with therapist preferences
  let prompt = template.replace('{summary}', sessionSummary);
  if (therapistPreferences.pronouns) {
    prompt = prompt.replace('{client_pronouns}', therapistPreferences.pronouns);
  }
  if (therapistPreferences.nextSession) {
    prompt = prompt.replace('{next_session}', therapistPreferences.nextSession);
  }
  
  // Call OpenClaw
  const response = await openclaw.complete({
    model: 'custom-api-deepseek-com/deepseek-chat',
    prompt: prompt,
    temperature: 0.3,  // Low for consistent clinical notes
    max_tokens: 1000,
    thinking: false
  });
  
  return response.text;
}

// Usage:
// const note = await generateCBTNote(
//   "Client discussed social anxiety...",
//   { pronouns: "they/them", nextSession: "1 week" }
// );
`;

console.log(integrationExample);

// Cost comparison
console.log('=== Cost Analysis ===\n');
console.log('Traditional (Claude API):');
console.log('  - Cost per note: ~$0.01');
console.log('  - 100 notes/month: $1.00');
console.log('  - 1000 notes/month: $10.00\n');

console.log('OpenClaw (DeepSeek):');
console.log('  - Cost per note: ~$0.001');
console.log('  - 100 notes/month: $0.10');
console.log('  - 1000 notes/month: $1.00\n');

console.log('Savings: 90% reduction in AI costs');
console.log('Monthly savings at 1000 notes: $9.00');
console.log('Annual savings: $108.00\n');

console.log('=== Next Steps ===');
console.log('1. Set up OpenClaw Gateway: npm install -g openclaw');
console.log('2. Configure model: openclaw config set model deepseek-chat');
console.log('3. Test template with real API call');
console.log('4. Build Bubble/Lovable frontend');
console.log('5. Integrate Stripe for payments');