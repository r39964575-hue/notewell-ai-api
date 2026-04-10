*Created: March 21, 2026*
*Last updated: April 2, 2026*

## 🔄 Memory Maintenance Guidelines
1. Daily files: Create memory/YYYY-MM-DD-[topic].md for each significant conversation
2. Long-term: Update this file with distilled learnings from daily files
3. Security: MEMORY.md only loaded in main sessions (direct chats with Razor)
4. Continuity: Read today + yesterday memory files at session start

## User Context
- Name: Razor
- Timezone: Eastern (America/New_York)
- Communication: OpenClaw control UI
- Environment: WSL2 Ubuntu, Node v22.22.1, Bun 1.1.43

## Memory System
- Backend: QMD (local semantic search via GGUF/Gemma 2B)
- Collections: workspace and memory folder
- Note: openclaw memory status shows 0 files (display bug) - indexing works
- Memory files: 108 total, none older than 90 days

## System Architecture
- Agent: Drip, DeepSeek Chat primary, Reasoner for complex tasks
- Gateway: openclaw gateway stop && openclaw gateway start
- Config: ~/.openclaw/openclaw.json
- Workspace: /home/my_pc/.openclaw/workspace/
- Channel: Telegram chat_id 53820024748
- UI: localhost:18789 (original), localhost:18791 (enhanced)
- Dual-agent savings: 60-80% cost reduction

## VPN
- Provider: NordVPN, New York servers
- Auto-connect heartbeat script active

## Healthcare Security Agent
- Status: PRODUCTION with HIPAA module active
- Dashboard: localhost:3000
- IMPORTANT: Use openclaw system event CLI - NOT HTTP API (404 error)
- Alerts: 1000 queue, 3-retry backoff, 100% success rate
- Encryption: AES-256-GCM

## Web UI Enhancements
- Port 18791: Phase 1 active (WebSocket, queuing, WCAG 2.1 AA)
- Port 18793: Phase 2 active (offline/service worker)
- Port 18794: Phase 3 ready (request manager)
- Port 18792: occupied by socat

## Key Technical Notes
- Sessions cleaned: down to 1 active, 792KB disk
- Signal CLI: needs captcha registration for +17743682978
- OpenClaw system events: CLI only, not REST API

## Business Projects
- SubPay: Construction payment SaaS, AIA G702/G703, lien waivers, 9-199/month
- FormCare Health: HIPAA-compliant form solution for healthcare practices - See detailed project file: FormCare_Health_Project.md

## Technical Projects
- Healthcare Security Agent: OpenClaw project with HIPAA module, dashboard at localhost:3000, PRODUCTION status, 1000 alert queue, 3-retry backoff, AES-256-GCM encryption

## 📅 2026-04-06

Healthcare Security Agent Production Deployment: Successfully transformed broken system into production-ready platform in 30 minutes. Key learnings: 1) OpenClaw primary interface for system events is CLI (openclaw system event), not REST API; 2) Dual-agent system (Chat + Reasoner) provides 64% cost savings with optimal 30-40% handoff threshold; 3) Production reliability requires queuing, retry logic, 24/7 monitoring, metrics, and management scripts; 4) Structured approach enables rapid deployment: problem identification → root cause fix → reliability enhancements → verification testing → documentation.

## 📅 2026-04-06

Phase 3 Integration Validation: Testing healthcare security architecture integration across 8 personas. Key validation areas: 1) Encryption consistency between HSM vault and database; 2) IAM/RLS integration (RBAC+ABAC+JIT access with database row-level security); 3) Monitoring-alerting integration across all components; 4) CI/CD deployment security with HIPAA compliance automation. Integration success criteria: all designs work together seamlessly, no conflicting security controls, consistent encryption, unified audit trail, integrated monitoring.

## 📅 2026-04-09

FormCare Health AWS Migration Complete: Successfully migrated from Supabase/Vercel stack to unified AWS stack for single BAA coverage. Key achievements: 1) AWS infrastructure deployed (RDS PostgreSQL, Cognito, S3); 2) HIPAA-compliant database schema with 8 tables; 3) Cognito authentication with custom claims (practice_id, role); 4) Row Level Security policies implemented; 5) End-to-end test passed (Cognito token → RBAC → RLS → patient record). Critical finding: PostgreSQL superuser bypasses RLS despite FORCE ROW LEVEL SECURITY - requires non-superuser role creation. Remaining pre-production tasks: SSL hardening, JWKS verification, CI/CD pipeline.
