# Note Templates Skill for OpenClaw

## Overview

This skill provides AI-powered clinical note templates for therapists and wellness coaches. It transforms brief session summaries into professional SOAP/DAP/progress notes using OpenClaw's AI capabilities.

## What's Included

### 1. CBT SOAP Template (`templates/cbt-soap.md`)
- Complete template for Cognitive Behavioral Therapy notes
- SOAP format (Subjective, Objective, Assessment, Plan)
- Example inputs and outputs
- Formatting guidelines and customization options

### 2. Configuration (`config.yaml`)
- Model settings (DeepSeek by default)
- Clinical preferences
- HIPAA compliance settings
- Cost optimization controls

### 3. Test Script (`test-cbt-note.js`)
- Demonstrates template usage
- Shows cost comparison (90% savings with OpenClaw)
- Provides integration examples

## Quick Start

### 1. Install OpenClaw
```bash
npm install -g openclaw
openclaw gateway start
```

### 2. Test the Template
```bash
cd skills/note-templates
node test-cbt-note.js
```

### 3. Generate a Note (Example)
```javascript
// Example using the template
const sessionSummary = "Client discussed social anxiety about upcoming party...";
const prompt = `SESSION SUMMARY PROVIDED BY THERAPIST:
${sessionSummary}

Please generate a professional SOAP note...`;

// Use OpenClaw to generate the note
const note = await openclaw.complete({
  model: 'custom-api-deepseek-com/deepseek-chat',
  prompt: prompt,
  temperature: 0.3,
  max_tokens: 1000
});
```

## Business Value

### Cost Savings
| Metric | Claude API | OpenClaw (DeepSeek) | Savings |
|--------|------------|---------------------|---------|
| Cost per note | $0.01 | $0.001 | 90% |
| 100 notes/month | $1.00 | $0.10 | $0.90 |
| 1000 notes/month | $10.00 | $1.00 | $9.00 |
| **Annual (10K notes)** | **$120.00** | **$12.00** | **$108.00** |

### Competitive Advantage
1. **90% lower AI costs** → Can charge $19/month instead of $29
2. **No API limits** → Scale without worry
3. **Full control** → No dependency on external AI providers
4. **HIPAA compliance** → Self-hosted option available

## How It Works

```
Therapist Summary → Template Engine → OpenClaw AI → Formatted Note → Therapist Review
```

1. Therapist provides 2-3 sentence summary of session
2. Template engine structures the prompt with clinical guidelines
3. OpenClaw generates professional note using DeepSeek
4. Therapist reviews and edits if needed
5. Note is saved to EHR/system

## Template Features

### For Therapists:
- **Specialty-specific**: CBT, trauma, nutrition, yoga therapy, etc.
- **Consistent formatting**: SOAP, DAP, or progress note formats
- **Clinical accuracy**: Uses appropriate terminology
- **Time savings**: 25+ minutes per note → 2 minutes

### For Developers:
- **Easy integration**: Simple prompt templates
- **Customizable**: Adjust pronouns, duration, follow-up timing
- **Extensible**: Add new templates easily
- **Cost-effective**: 90% cheaper than Claude/OpenAI

## Next Templates to Build

1. **Trauma-DAP** - Trauma-informed DAP notes
2. **Nutrition-SOAP** - Nutrition coaching SOAP notes  
3. **Yoga-Therapy** - Yoga therapy progress notes
4. **Life-Coaching** - Life coaching session notes
5. **Couples-Therapy** - Couples counseling notes

## Integration with No-Code Platforms

### Bubble.io Example:
1. Create input field for session summary
2. Add button "Generate Note"
3. Call OpenClaw API with template
4. Display generated note in text area
5. Add "Save to EHR" button

### Lovable Example:
1. Similar flow to Bubble
2. Use webhook to OpenClaw Gateway
3. Store notes in database
4. Add therapist customization options

## HIPAA Compliance

### Self-Hosted Option:
- Run OpenClaw Gateway on HIPAA-compliant server (AWS, Aptible)
- Encrypt all notes at rest and in transit
- Implement audit logging
- Regular security assessments

### Managed Option:
- Use OpenClaw Cloud with BAA
- Still 90% cheaper than Claude
- Less technical overhead

## Getting Started with Your MVP

### Week 1:
1. Set up OpenClaw Gateway
2. Test CBT template with 5 sample summaries
3. Build simple Bubble/Lovable frontend
4. Create landing page

### Week 2:
1. Add 2 more templates (trauma, nutrition)
2. Implement Stripe for payments ($19/month)
3. Get 5 beta testers from therapist communities

### Week 3:
1. Collect feedback and iterate
2. Add customization options
3. Launch to first 20 paying customers

## Support & Community

- OpenClaw Discord: https://discord.com/invite/clawd
- Therapist communities: r/therapists, Facebook groups
- No-code communities: Bubble forum, Makerpad

## License

This skill is open source and can be modified for your specific needs. Attribution appreciated but not required.

---

*Built for the NoteWell AI business plan - Turning 25 minutes of note-writing into 60 seconds with AI.*