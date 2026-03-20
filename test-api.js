// Test script for NoteWell AI API
// Run this to test the API before connecting Bubble

const fetch = require('node-fetch');

const API_BASE = 'http://localhost:3000/api';

async function testAPI() {
  console.log('=== Testing NoteWell AI API ===\n');
  
  // Test 1: Health check
  console.log('1. Testing health endpoint...');
  try {
    const healthRes = await fetch(`${API_BASE}/health`);
    const healthData = await healthRes.json();
    console.log('✓ Health check passed:', healthData.status);
  } catch (error) {
    console.log('✗ Health check failed:', error.message);
    return;
  }
  
  // Test 2: Get templates
  console.log('\n2. Testing templates endpoint...');
  try {
    const templatesRes = await fetch(`${API_BASE}/templates`);
    const templatesData = await templatesRes.json();
    console.log('✓ Available templates:');
    templatesData.templates.forEach(t => console.log(`   - ${t.id}: ${t.name}`));
  } catch (error) {
    console.log('✗ Templates endpoint failed:', error.message);
  }
  
  // Test 3: Generate note
  console.log('\n3. Testing note generation...');
  const testData = {
    summary: "Client reported increased anxiety about work presentations this week. We identified 'catastrophizing' cognitive distortion. Practiced cognitive restructuring with thought record. Assigned homework to complete thought record for 3 anxiety-provoking situations.",
    specialty: "cbt",
    client_pronouns: "they/them",
    session_duration: "50",
    therapist_name: "Dr. Smith"
  };
  
  try {
    const noteRes = await fetch(`${API_BASE}/generate-note`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(testData)
    });
    
    const noteData = await noteRes.json();
    
    if (noteData.success) {
      console.log('✓ Note generation successful!');
      console.log(`   Cost: $${noteData.metadata.cost}`);
      console.log(`   Note length: ${noteData.metadata.note_length} chars`);
      console.log(`\nGenerated note preview:`);
      console.log(noteData.note.substring(0, 300) + '...');
      
      console.log(`\nCost tracking:`);
      console.log(`   Total notes: ${noteData.cost_tracking.total_notes}`);
      console.log(`   Total cost: $${noteData.cost_tracking.total_cost}`);
      console.log(`   Cost per note: $${noteData.cost_tracking.cost_per_note}`);
    } else {
      console.log('✗ Note generation failed:', noteData.error);
    }
  } catch (error) {
    console.log('✗ Note generation endpoint failed:', error.message);
  }
  
  // Test 4: Get stats
  console.log('\n4. Testing stats endpoint...');
  try {
    const statsRes = await fetch(`${API_BASE}/stats`);
    const statsData = await statsRes.json();
    console.log('✓ Stats retrieved:');
    console.log(`   Total notes: ${statsData.stats.total_notes_generated}`);
    console.log(`   Total cost: ${statsData.stats.total_cost}`);
    console.log(`   Savings vs Claude: ${statsData.stats.savings_vs_claude}`);
  } catch (error) {
    console.log('✗ Stats endpoint failed:', error.message);
  }
  
  // Test 5: Error handling
  console.log('\n5. Testing error handling...');
  const badData = {
    summary: "too short",
    specialty: "invalid"
  };
  
  try {
    const errorRes = await fetch(`${API_BASE}/generate-note`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(badData)
    });
    
    const errorData = await errorRes.json();
    if (!errorData.success) {
      console.log('✓ Error handling working:', errorData.error);
    } else {
      console.log('✗ Expected error but got success');
    }
  } catch (error) {
    console.log('✗ Error test failed:', error.message);
  }
  
  console.log('\n' + '='.repeat(50));
  console.log('API Test Complete!');
  console.log('\nNext steps for Bubble integration:');
  console.log('1. Keep this API server running');
  console.log('2. In Bubble, install "API Connector" plugin');
  console.log('3. Add new API with base URL: http://localhost:3000/api');
  console.log('4. Create "generate_note" action with POST method');
  console.log('5. Add parameters from testData above');
  console.log('6. Create workflow that calls this API');
  console.log('\nFor production deployment:');
  console.log('1. Deploy this API to a cloud server (Render, Railway, etc.)');
  console.log('2. Update Bubble API URL to your production endpoint');
  console.log('3. Add authentication if needed');
  console.log('4. Set up SSL certificate (HTTPS)');
}

// Run tests
testAPI().catch(console.error);