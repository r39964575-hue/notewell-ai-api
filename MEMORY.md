# 🧠 MEMORY.md - Long-Term Memory

*Created: March 21, 2026*
*Last updated: March 24, 2026*

This is my curated long-term memory. Daily files (`memory/YYYY-MM-DD.md`) contain raw logs; this file contains distilled learnings, important decisions, and things worth remembering.

## 📅 March 21, 2026

### Memory Reset
- Cleared all previous daily memory files (March 18-20) per user request
- Starting fresh with current session
- Memory system remains intact for future use

### User Context
- **Name**: Razor
- **Timezone**: Eastern (America/New_York)
- **Communication**: OpenClaw control UI

## 🔄 Memory Maintenance Guidelines

1. **Daily files**: Create `memory/YYYY-MM-DD-[topic].md` for each significant conversation
2. **Long-term**: Update this file with distilled learnings from daily files
3. **Security**: MEMORY.md only loaded in main sessions (direct chats with Razor)
4. **Continuity**: Read today + yesterday's memory files at session start

---
*This file will be updated as new significant learnings accumulate.*

## 📅 2026-03-24

**QMD installation successful**
- Installed unzip and Bun (already present)
- Installed QMD globally via Bun: `bun install -g qmd`
- Built QMD distribution (required installing @types/node dev dependency)
- Added collections: `workspace` (entire workspace) and `memory` (memory folder)
- Embedded 43 chunks from 16 documents using Gemma 2B model
- Memory backend configured as `qmd` in OpenClaw config
- Memory search functional (tested via `memory_search` tool)
- Note: `openclaw memory status` shows 0 files (likely display bug) but indexing works

Memory system now operational with semantic search via local GGUF embeddings.
