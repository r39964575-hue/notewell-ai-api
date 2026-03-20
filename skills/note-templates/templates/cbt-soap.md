# CBT SOAP Note Template

## Template ID: CBT-SOAP-001
**Modality:** Cognitive Behavioral Therapy  
**Format:** SOAP (Subjective, Objective, Assessment, Plan)  
**Specialty:** CBT, Depression, Anxiety, OCD

## Prompt Template

```
You are a clinical AI assistant helping a therapist write a SOAP note for a Cognitive Behavioral Therapy session.

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
```

## Example Input/Output

### Input (Therapist Summary):
"Client reported increased anxiety about work presentations. We identified 'catastrophizing' cognitive distortion. Practiced cognitive restructuring with thought record. Assigned homework to complete thought record for 3 anxiety-provoking situations."

### Output (Generated Note):

**SUBJECTIVE:**
Client reported elevated anxiety symptoms this week, particularly related to upcoming work presentations. Described physical symptoms of anxiety including increased heart rate and sleep disturbance. Completed 2 of 3 assigned thought records from previous session, noting difficulty identifying automatic thoughts in the moment.

**OBJECTIVE:**
Client presented with anxious affect, fidgeting, and rapid speech when discussing work situations. Identified cognitive distortion of catastrophizing ("If I mess up this presentation, I'll get fired and never work again"). Engaged well in cognitive restructuring exercise, demonstrating understanding of the connection between thoughts, emotions, and behaviors. No assessment tools administered this session.

**ASSESSMENT:**
Client continues to experience anxiety symptoms with situational triggers. Demonstrates good insight into cognitive distortions but struggles with real-time application of CBT techniques. Progress noted in ability to identify catastrophizing patterns. Risk assessment: No SI/HI reported. Moderate impairment in work functioning due to anxiety.

**PLAN:**
1. Homework: Complete thought record for 3 anxiety-provoking situations with focus on identifying and challenging catastrophizing thoughts.
2. Next session: Practice behavioral experiment - prepare and deliver brief presentation in session.
3. Continue cognitive restructuring work with emphasis on developing coping statements.
4. Follow-up in 1 week.

**NOTES:**
Session focused on psychoeducation about anxiety maintenance cycle and CBT intervention for catastrophizing. Client expressed motivation to apply techniques.

## Formatting Rules

1. **Bold headers** for each SOAP section
2. **Bullet points** within sections for readability
3. **Clinical terminology** appropriate for CBT
4. **No markdown tables** - use plain text formatting
5. **Word limit:** 250-400 words total
6. **Tone:** Professional, objective, clinical

## Customization Variables

The following can be adjusted based on therapist preference:
- `{client_pronouns}`: he/him, she/her, they/them
- `{session_duration}`: 45, 50, 60 minutes
- `{next_session}`: 1 week, 2 weeks, 1 month
- `{therapist_name}`: Dr. [Name], [Name], LCSW

## Quality Guidelines

1. **Accuracy:** Faithfully represent the session summary
2. **Completeness:** Cover all SOAP elements
3. **Clinical soundness:** Use appropriate CBT concepts
4. **Privacy:** No PHI generation
5. **Consistency:** Maintain same format across notes

## Integration Code Example

```javascript
// Example using OpenClaw API
const generateCBTNote = async (sessionSummary) => {
  const prompt = cbtTemplate.replace('{summary}', sessionSummary);
  const response = await openclaw.complete({
    model: 'deepseek-chat',
    prompt: prompt,
    temperature: 0.3,
    max_tokens: 1000
  });
  return response.text;
};
```