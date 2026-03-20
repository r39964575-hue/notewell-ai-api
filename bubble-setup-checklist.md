# Bubble.io Setup Checklist for NoteWell AI

## Phase 1: Account & Basic Setup (Day 1 - 1 hour)

### ✅ 1.1 Create Bubble Account
- [ ] Go to [bubble.io](https://bubble.io)
- [ ] Click "Start Building"
- [ ] Sign up with email
- [ ] Verify email address

### ✅ 1.2 Create New App
- [ ] Click "New Application"
- [ ] Name: `notewell-ai`
- [ ] Choose "Blank App"
- [ ] Region: US East (recommended)
- [ ] Click "Create Application"

### ✅ 1.3 Install Required Plugins
Go to **Plugins > Install Plugin**:

**Essential Plugins:**
- [ ] **API Connector** (for OpenClaw integration)
- [ ] **Bubble Native** (for authentication)
- [ ] **Stripe** (for payments)
- [ ] **Toolbox** (optional, for UI components)

**To Install:**
1. Click "Install Plugin"
2. Search for plugin name
3. Click "Install"
4. Configure if needed (Stripe needs API keys)

## Phase 2: Data Structure (Day 1 - 1 hour)

### ✅ 2.1 Create Data Types
Go to **Data > Data Types**:

**User (Therapist)**
- [ ] email (text)
- [ ] name (text)
- [ ] specialty (text)
- [ ] subscription_status (text) - "trial", "active", "cancelled"
- [ ] stripe_customer_id (text)
- [ ] created_date (date/time)

**Client**
- [ ] name (text)
- [ ] pronouns (text)
- [ ] therapist (User - connect to User type)
- [ ] diagnosis (text)
- [ ] created_date (date/time)

**Session Note**
- [ ] client (Client - connect to Client type)
- [ ] therapist (User - connect to User type)
- [ ] session_date (date/time)
- [ ] session_duration (number)
- [ ] summary (text)
- [ ] generated_note (text)
- [ ] final_note (text)
- [ ] specialty (text)
- [ ] status (text) - "draft", "generated", "finalized"
- [ ] created_date (date/time)

## Phase 3: Authentication Pages (Day 1 - 2 hours)

### ✅ 3.1 Create Pages
Go to **Design > Pages**:

**Login Page** (`/login`)
- [ ] Create new page
- [ ] Add elements:
  - Email input field
  - Password input field
  - "Login" button
  - "Sign up" link
- [ ] Set up workflow:
  - When "Login" clicked → Bubble Native: Login user
  - On success → Navigate to /dashboard
  - On error → Show error message

**Signup Page** (`/signup`)
- [ ] Create new page
- [ ] Add elements:
  - Name input
  - Email input
  - Password input
  - Specialty dropdown (CBT, Trauma, Nutrition, Yoga, Life Coaching)
  - "Create Account" button
- [ ] Set up workflow:
  - When "Create Account" clicked → Bubble Native: Sign up user
  - Create new User in database
  - Set subscription_status to "trial"
  - Navigate to /dashboard

**Dashboard Page** (`/dashboard`)
- [ ] Create new page (we'll build content later)
- [ ] Set as "App starting page" in Settings

## Phase 4: Note Generator Interface (Day 2 - 3 hours)

### ✅ 4.1 Create Note Generator Page (`/generate-note`)

**Layout Setup:**
- [ ] Add "Group" element for main container
- [ ] Set layout to "Row" (for two columns)
- [ ] Add two more Groups inside: left-panel (30%), right-panel (70%)

**Left Panel Elements:**
1. **Client Selector**
   - [ ] Add "Dropdown" element
   - [ ] Set "Choices" to "Dynamic"
   - [ ] Choose type: Client
   - [ ] Set filter: Client's therapist = current user

2. **Session Details**
   - [ ] Add "Date/Time Picker" for session date
   - [ ] Add "Dropdown" for duration (45, 50, 60)
   - [ ] Set default to 50

3. **Specialty Selector**
   - [ ] Add "Dropdown" for specialty
   - [ ] Set static choices: CBT, Trauma, Nutrition, Yoga, Life Coaching
   - [ ] Set default to CBT

4. **Session Summary Input**
   - [ ] Add "Text Area" element
   - [ ] Set placeholder: "Briefly describe the session (2-3 sentences)..."
   - [ ] Set max characters: 500
   - [ ] Make it required

5. **Generate Button**
   - [ ] Add "Button" element
   - [ ] Label: "🔄 Generate Note"
   - [ ] Style with primary color

**Right Panel Elements:**
1. **Generated Note Display**
   - [ ] Add "Text Area" element
   - [ ] Set to "Read-only" initially
   - [ ] Set placeholder: "AI-generated note will appear here..."
   - [ ] Make it taller (10+ rows)

2. **Action Buttons**
   - [ ] Add button group with:
     - "Edit Note" (makes text area editable)
     - "Save to Client Record"
     - "Export as PDF"
     - "Start Over"

## Phase 5: API Integration (Day 2 - 2 hours)

### ✅ 5.1 Configure API Connector
Go to **Plugins > API Connector**:

**Add New API:**
- [ ] Click "Add another API"
- [ ] Name: `OpenClaw API`
- [ ] Privacy: Private
- [ ] Authentication: None (or add if your API has auth)

**Add Generate Note Action:**
- [ ] Click "Add another call"
- [ ] Action name: `generate_note`
- [ ] Method: POST
- [ ] URL: `http://localhost:3000/api/generate-note` (local) or your production URL
- [ ] Use as: Webhook

**Set Parameters:**
- [ ] Click "Initialize call with parameters"
- [ ] Add parameters:
  - `summary` (text) - will map to session summary input
  - `specialty` (text) - will map to specialty dropdown
  - `client_pronouns` (text) - will map to selected client's pronouns
  - `session_duration` (text) - will map to duration dropdown
  - `therapist_name` (text) - will map to current user's name

### ✅ 5.2 Create Workflow
On the Generate Note button:

**Workflow Steps:**
1. [ ] **Step 1:** Show loading state on button
2. [ ] **Step 2:** Make API Call → generate_note
   - Map parameters to UI elements
3. [ ] **Step 3:** On success → Set Generated Note text area value to API response
4. [ ] **Step 4:** On success → Hide loading state
5. [ ] **Step 5:** On error → Show error message
6. [ ] **Step 6:** On error → Hide loading state

**Specific Settings:**
- [ ] Set "Generate Note" button to "Show progress while workflow runs"
- [ ] Add "Loading" text: "Generating AI note..."
- [ ] Add error message element that shows on API failure

## Phase 6: Dashboard & Navigation (Day 3 - 2 hours)

### ✅ 6.1 Build Dashboard (`/dashboard`)

**Header:**
- [ ] Add welcome message: "Welcome, [Current User's Name]!"
- [ ] Add navigation menu:
  - "New Note" (links to /generate-note)
  - "My Clients" (links to /clients)
  - "Billing" (links to /billing)
  - "Logout"

**Quick Stats:**
- [ ] Add text elements that show:
  - Notes this month (count of Session Notes for current user this month)
  - Active clients (count of Client records for current user)
  - Time saved (notes count × 25 minutes ÷ 60)

**Recent Notes:**
- [ ] Add "Repeating Group" element
- [ ] Data source: Session Notes
- [ ] Filter: Session Note's therapist = current user
- [ ] Sort: created_date descending
- [ ] Limit: 5
- [ ] Display: Client name, session date, note preview

**Quick Actions:**
- [ ] Add buttons:
  - "New Note" (navigates to /generate-note)
  - "Add Client" (opens popup or navigates)
  - "View Billing" (navigates to /billing)

### ✅ 6.2 Navigation Setup
- [ ] Add header/navigation to all pages
- [ ] Make sure logout works on all pages
- [ ] Set up conditional navigation (show login if not logged in)

## Phase 7: Client Management (Day 3 - 2 hours)

### ✅ 7.1 Clients List Page (`/clients`)
- [ ] Add "Repeating Group" showing all clients for current user
- [ ] Add search/filter functionality
- [ ] Add "Add New Client" button
- [ ] Make each client clickable to go to client detail

### ✅ 7.2 Client Detail Page (`/client/[id]`)
- [ ] Display client information
- [ ] Show session history (repeating group of notes for this client)
- [ ] Add "Add Session" button that goes to /generate-note with client pre-selected

### ✅ 7.3 Add Client Popup/Page
- [ ] Simple form with:
  - Name
  - Pronouns (dropdown: they/them, he/him, she/her)
  - Diagnosis (optional)
- [ ] Save to database

## Phase 8: Stripe Billing (Day 4 - 2 hours)

### ✅ 8.1 Get Stripe API Keys
- [ ] Sign up at [stripe.com](https://stripe.com)
- [ ] Go to Developers → API Keys
- [ ] Copy:
  - Publishable key (starts with pk_)
  - Secret key (starts with sk_)

### ✅ 8.2 Configure Stripe Plugin
- [ ] Go to Plugins → Stripe
- [ ] Enter publishable key
- [ ] Enter secret key
- [ ] Save

### ✅ 8.3 Create Billing Page (`/billing`)

**For Trial Users:**
- [ ] Show: "You're on a 14-day free trial"
- [ ] Show: "Upgrade to continue after trial"
- [ ] Add "Subscribe Now" button

**For Subscribed Users:**
- [ ] Show: "Current Plan: Starter ($19/month)"
- [ ] Show: "Next billing date: [date]"
- [ ] Show: "Payment method: [last4]"
- [ ] Add "Update Payment Method" button
- [ ] Add "Cancel Subscription" button

**Subscription Workflow:**
1. [ ] When "Subscribe" clicked → Stripe: Create checkout session
2. [ ] Set price: $19/month
3. [ ] Set success URL: /dashboard?subscribed=true
4. [ ] Set cancel URL: /billing?cancelled=true
5. [ ] Redirect to Stripe checkout
6. [ ] On return, update user.subscription_status to "active"

## Phase 9: Polish & Testing (Day 4 - 2 hours)

### ✅ 9.1 Add CSS Styling
Go to **Styles** tab:

**Create Styles:**
- [ ] Primary color: #4F46E5 (indigo)
- [ ] Secondary color: #10B981 (emerald)
- [ ] Background: #F9FAFB
- [ ] Text: #1F2937

**Apply Styles:**
- [ ] Style buttons with primary color
- [ ] Style headers with appropriate sizes
- [ ] Add padding/margin for good spacing
- [ ] Make sure text is readable

### ✅ 9.2 Mobile Responsiveness
- [ ] Test on mobile preview
- [ ] Adjust layouts for mobile:
  - Stack columns vertically
  - Adjust font sizes
  - Make buttons larger for touch
- [ ] Use Bubble's responsive settings

### ✅ 9.3 Error Handling
- [ ] Add error messages for:
  - API failures
  - Form validation errors
  - Payment failures
- [ ] Make sure loading states work
- [ ] Add "Retry" buttons where appropriate

### ✅ 9.4 Test Complete Flow
Test as a new user:
1. [ ] Sign up → Success
2. [ ] Login → Success
3. [ ] Add a client → Success
4. [ ] Generate a note → Success
5. [ ] Save note → Success
6. [ ] Subscribe to plan → Success
7. [ ] Logout → Success

## Phase 10: Deployment (Day 4 - 1 hour)

### ✅ 10.1 Prepare for Production
- [ ] Update API URL from localhost to production server
- [ ] Test with production API
- [ ] Update Stripe to live keys (not test keys)
- [ ] Set up custom domain (optional)

### ✅ 10.2 Deploy to Bubble
- [ ] Go to "Deploy" tab
- [ ] Click "Deploy to Live"
- [ ] Choose version name
- [ ] Click "Deploy"
- [ ] Wait for deployment to complete

### ✅ 10.3 Post-Deployment
- [ ] Test live site
- [ ] Set up analytics (optional)
- [ ] Create backup of Bubble app
- [ ] Document any issues found

## Quick Start Commands

### Local Development:
```bash
# Start OpenClaw API server
cd /path/to/notewell-ai
npm install
node openclaw-api-server.js

# In another terminal, start OpenClaw Gateway
openclaw gateway start
```

### Bubble Development:
1. Open Bubble editor in browser
2. Follow checklist above
3. Test with local API (http://localhost:3000)
4. Deploy when ready

## Troubleshooting

### API Connection Issues:
- Check OpenClaw API is running: `curl http://localhost:3000/api/health`
- Check Bubble API Connector settings
- Check CORS on your server

### Stripe Issues:
- Use test cards: 4242 4242 4242 4242
- Check Stripe dashboard for errors
- Verify webhook endpoints

### Performance Issues:
- Optimize database queries in Bubble
- Add pagination to repeating groups
- Cache templates locally

## Cost Summary

### Monthly Costs:
- **Bubble Personal Plan**: $29/month
- **OpenClaw AI**: ~$1/month (at 1000 notes)
- **Stripe fees**: 2.9% + $0.30 per transaction
- **Total fixed**: ~$30/month

### Revenue Model:
- **Price**: $19/month per therapist
- **Break-even**: 2 therapists ($38 revenue)
- **Profit margin**: ~90% after 2 therapists

### Growth Targets:
- Month 1: 5 therapists → $95 revenue
- Month 2: 15 therapists → $285 revenue  
- Month 3: 30 therapists → $570 revenue
- Month 6: 100 therapists → $1,900 revenue

## Next Features to Add

### Phase 2 (Month 2-3):
1. More note templates (10+ specialties)
2. PDF export with branding
3. EHR integration (SimplePractice, TherapyNotes)
4. Voice dictation input

### Phase 3 (Month 4-6):
1. Team features (multiple therapists per practice)
2. Advanced analytics
3. Mobile app (wrap Bubble with native wrapper)
4. White-label version

## Support Resources

- Bubble Docs: https://bubble.io/docs
- Bubble Forum: https://forum.bubble.io
- OpenClaw Discord: https://discord.com/invite/clawd
- Stripe Docs: https://stripe.com/docs

---

**Estimated Total Time**: 12-15 hours  
**Cost to Launch**: ~$30/month  
**Time to First Customer**: 3-4 days  
**Break-even Point**: 2 customers  

Ready to start? Begin with Phase 1 and work through the checklist!