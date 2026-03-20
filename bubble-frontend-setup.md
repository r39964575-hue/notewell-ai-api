# Bubble.io Frontend Setup for NoteWell AI

## Overview

This guide walks you through building the Bubble.io frontend for your NoteWell AI application. Bubble is a no-code platform that will connect to your OpenClaw backend.

## What We're Building

1. **User Authentication** - Therapist login/signup
2. **Dashboard** - Overview of notes, clients, billing
3. **Note Generator** - Main interface for creating notes
4. **Client Management** - Client profiles and history
5. **Billing** - Stripe integration for $19/month subscriptions

## Step 1: Create Bubble Account & App

### 1.1 Sign up for Bubble
- Go to [bubble.io](https://bubble.io)
- Choose "Start Building" (free plan available)
- Create account with email

### 1.2 Create New App
- Click "New Application"
- Name: `notewell-ai`
- Choose "Blank App" template
- Region: Choose closest to you (US East recommended)

## Step 2: Set Up Data Structure

### 2.1 Create Data Types
In Bubble, go to **Data > Data Types** and create:

#### User (Therapist)
- email (text)
- name (text) 
- specialty (text) - CBT, trauma, etc.
- subscription_status (text) - active, trial, cancelled
- stripe_customer_id (text)
- created_date (date)

#### Client
- name (text)
- pronouns (text)
- therapist (User)
- diagnosis (text)
- created_date (date)

#### Session Note
- client (Client)
- therapist (User)
- session_date (date)
- session_duration (number) - 45, 50, 60 minutes
- summary (text) - therapist's brief input
- generated_note (text) - AI-generated note
- final_note (text) - after therapist edits
- specialty (text) - CBT, trauma, etc.
- status (text) - draft, generated, finalized
- created_date (date)

#### Template
- name (text)
- specialty (text)
- prompt_template (text)
- example_input (text)
- example_output (text)

## Step 3: Build Authentication

### 3.1 Install Plugin
- Go to **Plugins > Install Plugin**
- Search for "Bubble Native"
- Install (this handles authentication)

### 3.2 Create Pages
1. **Login Page** (`/login`)
   - Email input
   - Password input
   - Login button
   - "Sign up" link

2. **Signup Page** (`/signup`)
   - Name input
   - Email input
   - Password input
   - Specialty dropdown
   - Create account button

3. **Dashboard** (`/dashboard`) - Main page after login

## Step 4: Note Generator Interface

### 4.1 Create Note Generator Page (`/generate-note`)

#### Layout:
```
┌─────────────────────────────────────┐
│ Header: NoteWell AI Logo + Nav      │
├─────────────────────────────────────┤
│ Left Panel (30%)                    │ │ Right Panel (70%)          │
│                                     │ │                            │
│ 1. Client Selector                  │ │ Generated Note Display     │
│    [Dropdown]                       │ │ [Text Area - Readonly]     │
│                                     │ │                            │
│ 2. Session Details                  │ │                            │
│    Date: [Date Picker]              │ │ Action Buttons:            │
│    Duration: [45▾ 50 60]            │ │ [Edit] [Save] [Export]     │
│                                     │ │                            │
│ 3. Specialty Template               │ │                            │
│    [CBT▾ Trauma Nutrition]          │ │                            │
│                                     │ │                            │
│ 4. Session Summary                  │ │                            │
│    [Text Area - 500 chars max]      │ │                            │
│                                     │ │                            │
│ 5. Generate Button                  │ │                            │
│    [🔄 Generate Note]                │ │                            │
└─────────────────────────────────────┘
```

### 4.2 Bubble Elements Needed:

#### Left Panel Elements:
1. **Dropdown** - Client selector (connected to Client data type)
2. **Date Picker** - Session date
3. **Dropdown** - Duration (45, 50, 60 minutes)
4. **Dropdown** - Specialty (CBT, trauma, nutrition, yoga, life coaching)
5. **Text Area** - Session summary (max 500 characters)
6. **Button** - "Generate Note"

#### Right Panel Elements:
1. **Text Area** - Display generated note (readonly initially)
2. **Button Group**:
   - "Edit Note" (makes text area editable)
   - "Save to Client Record"
   - "Export as PDF"
   - "Start Over"

## Step 5: Connect to OpenClaw API

### 5.1 Install API Connector Plugin
- Go to **Plugins > Install Plugin**
- Search for "API Connector"
- Install

### 5.2 Configure API Call

#### In API Connector:
1. Click "Add another API"
2. Name: `OpenClaw Note Generator`
3. Privacy: Private
4. Authentication: None (or add if your OpenClaw has auth)

#### Add Action:
```
Action Name: generate_note
Method: POST
URL: http://localhost:3000/api/generate-note  # Your OpenClaw endpoint
```

#### Parameters (JSON):
```json
{
  "summary": "{{session_summary}}",
  "specialty": "{{selected_specialty}}",
  "client_pronouns": "{{selected_client.pronouns}}",
  "session_duration": "{{selected_duration}}",
  "therapist_name": "{{current_user.name}}"
}
```

### 5.3 Create Workflow

On your Generate Note button, add workflow:

```
When Button is clicked:
1. Show loading state on button
2. Make API Call: generate_note
   - summary: Session Summary Input's value
   - specialty: Specialty Dropdown's value
   - etc.
3. When API returns success:
   - Set Generated Note Text Area's value to API response.note
   - Hide loading state
4. When API returns error:
   - Show error message
   - Hide loading state
```

## Step 6: Create Dashboard

### 6.1 Dashboard Layout (`/dashboard`)
```
┌─────────────────────────────────────┐
│ Welcome, [Therapist Name]!          │
│                                     │
│ Quick Stats:                        │
│ • Notes this month: 24              │
│ • Active clients: 8                 │
│ • Time saved: 10 hours              │
│                                     │
│ Recent Notes:                       │
│ [List of last 5 notes with dates]   │
│                                     │
│ Quick Actions:                      │
│ [New Note] [Add Client] [Billing]   │
└─────────────────────────────────────┘
```

### 6.2 Elements:
1. **Repeating Group** - Recent notes (connected to Session Note data)
2. **Text Elements** - Stats (use Bubble's expressions to calculate)
3. **Buttons** - Quick actions

## Step 7: Client Management

### 7.1 Client List Page (`/clients`)
- Repeating group showing all clients
- Add client button
- Search/filter functionality

### 7.2 Client Detail Page (`/client/[id]`)
- Client info
- Session history (repeating group)
- Add new session button

## Step 8: Stripe Integration for Billing

### 8.1 Install Stripe Plugin
- Go to **Plugins > Install Plugin**
- Search for "Stripe"
- Install official Stripe plugin

### 8.2 Configure Stripe
1. Get Stripe API keys from [stripe.com](https://stripe.com)
2. In Bubble Stripe plugin settings, add:
   - Publishable key
   - Secret key

### 8.3 Create Subscription Flow

#### Billing Page (`/billing`):
```
Current Plan: Starter ($19/month)
Billing Period: Monthly
Next Charge: April 19, 2026
Payment Method: Visa ****1234

[Update Payment Method]
[Cancel Subscription]
```

#### Workflow for New Subscription:
```
When "Subscribe" button clicked:
1. Stripe: Create checkout session
   - Price: $19/month
   - Success URL: /dashboard?success=true
   - Cancel URL: /billing?cancelled=true
2. Redirect to Stripe checkout
3. On return, update user.subscription_status to "active"
```

## Step 9: Responsive Design

### 9.1 Mobile Optimization
- Use Bubble's responsive settings
- Stack panels vertically on mobile
- Adjust font sizes for mobile

### 9.2 Breakpoints:
- Desktop: > 992px (side-by-side panels)
- Tablet: 768px - 992px (adjusted layout)
- Mobile: < 768px (stacked layout)

## Step 10: Testing & Deployment

### 10.1 Test Workflows
1. User signup/login
2. Create new note
3. Generate AI note
4. Save/export note
5. Subscribe to plan

### 10.2 Deploy to Production
1. In Bubble, click "Deploy" tab
2. Choose "Live" version
3. Set custom domain (optional)
4. Deploy!

## Sample Bubble Setup Files

I'll create some sample files to help you get started:

### 1. OpenClaw API Endpoint (Node.js)
Create this on your server where OpenClaw is running:

```javascript
// server.js - OpenClaw API endpoint
const express = require('express');
const app = express();
app.use(express.json());

app.post('/api/generate-note', async (req, res) => {
  const { summary, specialty, client_pronouns, session_duration, therapist_name } = req.body;
  
  // Load appropriate template based on specialty
  const template = loadTemplate(specialty);
  const prompt = template.replace('{summary}', summary)
                        .replace('{client_pronouns}', client_pronouns || 'they/them')
                        .replace('{session_duration}', session_duration || '50')
                        .replace('{therapist_name}', therapist_name || 'Therapist');
  
  // Call OpenClaw
  const note = await generateNoteWithOpenClaw(prompt);
  
  res.json({ 
    success: true, 
    note: note,
    cost: 0.001, // Cost per note in dollars
    generated_at: new Date().toISOString()
  });
});

app.listen(3000, () => console.log('OpenClaw API running on port 3000'));
```

### 2. Bubble Workflow JSON Export
Save this as `bubble-workflow-export.json` and import to Bubble:

```json
{
  "workflows": {
    "generate_note": {
      "name": "Generate AI Note",
      "steps": [
        {
          "type": "element_trigger",
          "element": "generate_button",
          "event": "click"
        },
        {
          "type": "element_action",
          "element": "generate_button",
          "action": "show_loading"
        },
        {
          "type": "api_call",
          "api": "openclaw_generate",
          "action": "generate_note",
          "parameters": {
            "summary": "input_session_summary_value",
            "specialty": "dropdown_specialty_value",
            "client_pronouns": "selected_client_pronouns",
            "session_duration": "dropdown_duration_value",
            "therapist_name": "current_user_name"
          }
        },
        {
          "type": "conditional",
          "condition": "api_call_success",
          "true_branch": [
            {
              "type": "element_action",
              "element": "text_area_note",
              "action": "set_value",
              "value": "api_response_note"
            },
            {
              "type": "element_action",
              "element": "generate_button",
              "action": "hide_loading"
            }
          ],
          "false_branch": [
            {
              "type": "show_message",
              "message": "Error generating note. Please try again.",
              "style": "error"
            },
            {
              "type": "element_action",
              "element": "generate_button",
              "action": "hide_loading"
            }
          ]
        }
      ]
    }
  }
}
```

### 3. CSS Styles for NoteWell AI
Add to Bubble's Styles tab:

```css
/* Main Colors */
:root {
  --primary: #4F46E5;  /* Indigo */
  --secondary: #10B981; /* Emerald */
  --background: #F9FAFB;
  --text: #1F2937;
  --border: #E5E7EB;
}

/* Note Container */
.note-container {
  border: 1px solid var(--border);
  border-radius: 8px;
  padding: 20px;
  background: white;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
}

/* Generated Note Styling */
.generated-note {
  font-family: 'Georgia', serif;
  line-height: 1.6;
  white-space: pre-wrap;
}

.generated-note h3 {
  color: var(--primary);
  border-bottom: 2px solid var(--secondary);
  padding-bottom: 8px;
  margin-top: 24px;
}

/* Loading Animation */
.loading-spinner {
  border: 3px solid var(--border);
  border-top: 3px solid var(--primary);
  border-radius: 50%;
  width: 24px;
  height: 24px;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* Mobile Responsive */
@media (max-width: 768px) {
  .two-column-layout {
    flex-direction: column;
  }
  
  .left-panel, .right-panel {
    width: 100% !important;
  }
}
```

## Quick Start Checklist

### Day 1 (2-3 hours):
- [ ] Create Bubble account and app
- [ ] Set up data types (User, Client, Session Note)
- [ ] Build login/signup pages
- [ ] Create dashboard shell

### Day 2 (3-4 hours):
- [ ] Build note generator page layout
- [ ] Install and configure API Connector
- [ ] Set up OpenClaw API endpoint (simple version)
- [ ] Test note generation workflow

### Day 3 (2-3 hours):
- [ ] Add client management pages
- [ ] Install and configure Stripe
- [ ] Set up subscription flow
- [ ] Test end-to-end: signup → generate note → subscribe

### Day 4 (2 hours):
- [ ] Polish UI with CSS
- [ ] Make responsive for mobile
- [ ] Add error handling and loading states
- [ ] Deploy to Bubble live

## Cost Estimate

### Bubble Costs:
- **Free Plan**: Good for testing (but limited features)
- **Personal Plan**: $29/month (unlimited apps, needed for production)
- **Professional Plan**: $119/month (if you need more capacity)

### Total Monthly Costs:
- Bubble: $29
- OpenClaw AI: ~$1 (at 1000 notes/month)
- Stripe fees: 2.9% + $0.30 per transaction
- **Total**: ~$30 + Stripe fees

### Break-even Point:
- 2 customers at $19/month = $38 revenue
- Covers Bubble + AI costs
- Every additional customer is mostly profit

## Troubleshooting Common Issues

### 1. API Connection Failed
- Check OpenClaw is running: `openclaw status`
- Verify endpoint URL in Bubble
- Check CORS settings on your server

### 2. Note Generation Too Slow
- Optimize OpenClaw model (use smaller model)
- Add loading states in Bubble
- Cache common templates

### 3. Stripe Payment Fails
- Verify Stripe API keys
- Check webhook endpoints
- Test with Stripe test cards

### 4. Mobile Layout Broken
- Use Bubble's responsive editor
- Test on different screen sizes
- Simplify layout for mobile

## Next Steps After MVP

1. **Add More Templates** - Trauma, nutrition, yoga therapy
2. **Export Options** - PDF, Word, EHR integration
3. **Team Features** - Multiple therapists per practice
4. **Analytics** - Note statistics, time savings reports
5. **Mobile App** - Wrap Bubble app with native wrapper

## Support Resources

- Bubble Documentation: https://bubble.io/docs
- Bubble Forum: https://forum.bubble.io
- OpenClaw Discord: https://discord.com/invite/clawd
- Stripe Documentation: https://stripe.com/docs

---

**Time Estimate**: 8-12 hours total for complete MVP
**Cost**: ~$30/month to run
**Revenue Potential**: $19/month per therapist
**Break-even**: 2 customers

Ready to start? Let me know which part you want to tackle first!