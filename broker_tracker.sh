#!/bin/bash

# Broker Outreach Tracker
# Simple script to track contacts with Cape Cod brokers

TRACKER_FILE="/home/my_pc/.openclaw/workspace/broker_tracker.csv"
BACKUP_DIR="/home/my_pc/.openclaw/workspace/backups"

# Create tracker file if it doesn't exist
init_tracker() {
    if [ ! -f "$TRACKER_FILE" ]; then
        echo "Creating new broker tracker file..."
        cat > "$TRACKER_FILE" << EOF
Brokerage,Contact Person,Email,Phone,Date Contacted,Method,Response Status,Next Action,Notes
Kinlin Grover Real Estate,Property Management Dept,pm@kinlingrover.com,(508) 555-XXXX,2026-03-20,Email,Pending,Follow up 2026-03-25,"Largest Cape Cod brokerage"
Sotheby's Cape Cod,Office Manager,manager@sothebyscapecod.com,(508) 555-XXXX,2026-03-20,Email,Pending,Follow up 2026-03-25,"High-end market focus"
Robert Paul Properties,Vacation Rental Manager,rentals@robertpaul.com,(508) 555-XXXX,2026-03-20,Email,Pending,Follow up 2026-03-25,"Established vacation rental program"
EOF
        echo "Tracker file created: $TRACKER_FILE"
    else
        echo "Tracker file already exists: $TRACKER_FILE"
    fi
}

# Add a new broker to track
add_broker() {
    echo "Adding new broker to tracker..."
    read -p "Brokerage name: " brokerage
    read -p "Contact person: " contact
    read -p "Email: " email
    read -p "Phone: " phone
    read -p "Date contacted (YYYY-MM-DD): " date
    read -p "Method (Email/Phone/LinkedIn): " method
    read -p "Response status (Pending/Replied/Meeting Scheduled): " status
    read -p "Next action: " next_action
    read -p "Notes: " notes
    
    echo "\"$brokerage\",\"$contact\",\"$email\",\"$phone\",\"$date\",\"$method\",\"$status\",\"$next_action\",\"$notes\"" >> "$TRACKER_FILE"
    echo "Broker added successfully!"
}

# List all brokers
list_brokers() {
    echo "Broker Outreach Tracker"
    echo "======================="
    column -t -s ',' "$TRACKER_FILE" 2>/dev/null || cat "$TRACKER_FILE"
}

# Show brokers needing follow-up
show_followups() {
    echo "Brokers Needing Follow-up"
    echo "========================="
    today=$(date +%Y-%m-%d)
    
    # Simple grep for follow-up actions
    grep -i "follow\|pending" "$TRACKER_FILE" | column -t -s ',' || echo "No follow-ups needed"
}

# Update broker status
update_status() {
    list_brokers
    echo ""
    read -p "Enter brokerage name to update: " broker_name
    read -p "New status: " new_status
    read -p "New next action: " new_action
    
    # Create temp file
    temp_file=$(mktemp)
    
    # Update the line
    awk -F',' -v broker="$broker_name" -v status="$new_status" -v action="$new_action" '
    BEGIN {OFS=","}
    $1 ~ broker {
        $7 = status
        $8 = action
    }
    {print}
    ' "$TRACKER_FILE" > "$temp_file"
    
    mv "$temp_file" "$TRACKER_FILE"
    echo "Status updated for $broker_name"
}

# Backup tracker
backup_tracker() {
    if [ ! -d "$BACKUP_DIR" ]; then
        mkdir -p "$BACKUP_DIR"
    fi
    
    backup_file="$BACKUP_DIR/broker_tracker_$(date +%Y%m%d_%H%M%S).csv"
    cp "$TRACKER_FILE" "$backup_file"
    echo "Backup created: $backup_file"
}

# Show stats
show_stats() {
    total=$(tail -n +2 "$TRACKER_FILE" | wc -l)
    pending=$(grep -i "pending" "$TRACKER_FILE" | wc -l)
    replied=$(grep -i "replied" "$TRACKER_FILE" | wc -l)
    meetings=$(grep -i "meeting" "$TRACKER_FILE" | wc -l)
    
    echo "Broker Outreach Statistics"
    echo "=========================="
    echo "Total brokers contacted: $total"
    echo "Pending responses: $pending"
    echo "Replied: $replied"
    echo "Meetings scheduled: $meetings"
    echo ""
    
    if [ $total -gt 0 ]; then
        response_rate=$((replied * 100 / total))
        echo "Response rate: $response_rate%"
    fi
}

# Help
show_help() {
    echo "Broker Outreach Tracker Commands:"
    echo "  init        - Initialize tracker file"
    echo "  add         - Add new broker"
    echo "  list        - List all brokers"
    echo "  followups   - Show brokers needing follow-up"
    echo "  update      - Update broker status"
    echo "  backup      - Create backup of tracker"
    echo "  stats       - Show outreach statistics"
    echo "  help        - Show this help"
}

# Main
case "$1" in
    init)
        init_tracker
        ;;
    add)
        add_broker
        ;;
    list)
        list_brokers
        ;;
    followups)
        show_followups
        ;;
    update)
        update_status
        ;;
    backup)
        backup_tracker
        ;;
    stats)
        show_stats
        ;;
    help|--help|-h)
        show_help
        ;;
    *)
        echo "Usage: $0 {init|add|list|followups|update|backup|stats|help}"
        ;;
esac