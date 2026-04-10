#!/bin/bash

# Memory management helpers for OpenClaw

MEMORY_DIR="/home/my_pc/.openclaw/workspace/memory"
LONG_TERM_MEMORY="/home/my_pc/.openclaw/workspace/MEMORY.md"

# Create a new memory file
new_memory() {
    local topic="$1"
    local date=$(date +%Y-%m-%d)
    local time=$(date +%H:%M)
    local timezone=$(date +%Z)
    
    if [ -z "$topic" ]; then
        echo "Usage: new_memory <topic>"
        echo "Example: new_memory video-creation-test"
        return 1
    fi
    
    local filename="${MEMORY_DIR}/${date}-${topic}.md"
    
    if [ -f "$filename" ]; then
        echo "Memory file already exists: $filename"
        return 1
    fi
    
    cat > "$filename" << EOF
# Session: ${date} ${time} ${timezone}

- **Session Key**: agent:main:main
- **Session ID**: \$(uuidgen 2>/dev/null || echo "generated-$(date +%s)")
- **Source**: webchat
- **Topic**: ${topic}

## Conversation Summary

[Brief summary of the conversation]

### Key Points Discussed:
1. 
2. 
3. 

### Decisions Made:
- 
- 
- 

### Actions Taken:
- 
- 
- 

### Technical Details:

### Follow-up Needed:
- 
- 
- 

## Notes & Observations

---
*File created: ${date}*  
*Last updated: ${date}*
EOF
    
    echo "Created memory file: $filename"
}

# List recent memory files
list_memories() {
    local days=${1:-7}
    echo "Recent memory files (last ${days} days):"
    echo "----------------------------------------"
    find -L "$MEMORY_DIR" -name "*.md" -type f -mtime -$days | sort -r | head -20
}

# Update long-term memory with a note
update_long_term() {
    local note="$1"
    local date=$(date +%Y-%m-%d)
    
    if [ -z "$note" ]; then
        echo "Usage: update_long_term \"Your note here\""
        return 1
    fi
    
    # Add to MEMORY.md
    cat >> "$LONG_TERM_MEMORY" << EOF

## 📅 ${date}

${note}
EOF
    
    echo "Updated long-term memory"
}

# Show memory stats
memory_stats() {
    echo "Memory System Stats:"
    echo "-------------------"
    echo "Total memory files: $(find -L "$MEMORY_DIR" -name "*.md" -type f | wc -l)"
    echo "Oldest file: $(find -L "$MEMORY_DIR" -name "*.md" -type f -printf '%T+ %p\n' | sort | head -1 | cut -d' ' -f2-)"
    echo "Newest file: $(find -L "$MEMORY_DIR" -name "*.md" -type f -printf '%T+ %p\n' | sort -r | head -1 | cut -d' ' -f2-)"
    echo "Long-term memory size: $(wc -l < "$LONG_TERM_MEMORY" 2>/dev/null || echo 0) lines"
}

# Help
memory_help() {
    echo "Memory Management Commands:"
    echo "  new_memory <topic>     - Create a new memory file"
    echo "  list_memories [days]   - List recent memory files (default: 7 days)"
    echo "  update_long_term \"note\" - Add note to long-term memory"
    echo "  memory_stats           - Show memory system statistics"
    echo "  memory_help            - Show this help"
}

# Main
case "$1" in
    new)
        new_memory "$2"
        ;;
    list)
        list_memories "$2"
        ;;
    update)
        update_long_term "$2"
        ;;
    stats)
        memory_stats
        ;;
    help|--help|-h)
        memory_help
        ;;
    *)
        echo "Usage: $0 {new|list|update|stats|help}"
        ;;
esac