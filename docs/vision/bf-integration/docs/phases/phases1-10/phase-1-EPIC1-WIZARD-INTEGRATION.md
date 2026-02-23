> [!WARNING]
> Status: Planned / In Development
> Context: Original BF-INTEGRATION Vision (Pre-Phase 30)
# Epic 1: Wizard → Job Orchestrator Integration (Design)

## Goal
Connect the 5-minute wizard frontend to the Job Orchestrator API with a minimal, secure, and testable flow.

## Minimal Endpoints (3)
1. POST /api/jobs
   - Create a job from wizard input (body: jobType, payload)
   - Auth: API Key or session cookie
   - Response: 201 + { jobId }

2. GET /api/jobs/:id
   - Get job status and result
   - Auth: API Key or session cookie
   - Response: 200 + { status, progress, result }

3. POST /api/webhooks/job-callback
   - Internal callback endpoint used by orchestrator to notify job completion (can be protected by a shared secret)
   - Auth: HMAC signature or shared secret header

## Authentication
- Use API keys for external integrations (simple header X-API-Key)
- For browser-based wizard, use secure session cookie (same auth as current app)

## Monitoring & Observability
- Emit job created/completed events to monitoring (metrics + logs)
- Minimal dashboard: job queue length, avg processing time, last error

## Validation & E2E
- Add E2E test: run wizard create → poll job → assert delivered
- Use Ethereal for email delivery in tests

## Next steps (today)
1. Implement server-side POST /api/jobs handler (accept wizard payload, create DB transaction, enqueue job)
2. Add GET /api/jobs/:id to return status
3. Add simple unit tests for create + status

*Prepared: 2025-12-17*

