# Memory System

This directory contains memory files for maintaining continuity across sessions.

## Structure

### Daily Memory Files
- Format: `YYYY-MM-DD-[topic].md`
- Created for each significant conversation
- Contains raw logs and detailed notes
- Use the template in `TEMPLATE.md` for consistency

### Long-Term Memory
- `../MEMORY.md` (in workspace root)
- Curated memories and distilled learnings
- Updated periodically from daily files
- Only loaded in main sessions (security)

## Usage

### Manual Creation
1. Copy `TEMPLATE.md` to a new file: `YYYY-MM-DD-topic.md`
2. Fill in the conversation details
3. Update `MEMORY.md` with significant learnings

### Using the Helper Script
```bash
# Create a new memory file
./memory_helpers.sh new "conversation-topic"

# List recent memory files
./memory_helpers.sh list 7

# Update long-term memory
./memory_helpers.sh update "Important learning note"

# Show statistics
./memory_helpers.sh stats
```

## Best Practices

1. **Create a file for each significant conversation**
2. **Use descriptive topic names** (e.g., `video-creation-test`, `memory-system-setup`)
3. **Update MEMORY.md weekly** with distilled learnings
4. **Keep daily files organized** by date and topic
5. **Review old files periodically** and archive if needed

## Session Startup Routine

At the start of each session:
1. Read `SOUL.md` - who you are
2. Read `USER.md` - who you're helping  
3. Read `memory/YYYY-MM-DD.md` files (today + yesterday)
4. In main sessions only: Read `MEMORY.md`

## Security Notes
- `MEMORY.md` contains personal context and should only be loaded in main sessions
- Daily memory files can be loaded in any session
- Be mindful of sensitive information in memory files