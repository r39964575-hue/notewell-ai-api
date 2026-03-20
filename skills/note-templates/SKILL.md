# Note Templates Skill

Specialty-specific AI note templates for therapists and wellness coaches.

## Description

This skill provides AI-powered note generation templates for various therapeutic modalities. Each template transforms a brief session summary into a professional clinical note following standard formats (SOAP, DAP, progress notes).

## Templates Available

1. **CBT-SOAP** - Cognitive Behavioral Therapy SOAP notes
2. **Trauma-DAP** - Trauma-informed DAP notes  
3. **Nutrition-SOAP** - Nutrition coaching SOAP notes
4. **Yoga-Therapy** - Yoga therapy progress notes
5. **Life-Coaching** - Life coaching session notes

## Usage

Each template is a separate file in the `templates/` directory with:
- Prompt template for AI generation
- Example inputs/outputs
- Formatting guidelines

## Integration

Use with OpenClaw's AI capabilities to generate notes from session summaries. The skill handles:
- Template selection based on specialty
- Formatting according to clinical standards
- HIPAA-compliant structure
- Customization options

## Configuration

Set default model and parameters in `config.yaml`:
```yaml
model: custom-api-deepseek-com/deepseek-chat
temperature: 0.3
max_tokens: 1000
```