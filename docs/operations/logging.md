# Logging & Diagnostics — Operations Guide

Purpose: guidance for BF operators and admins on using the new structured logging system (Phase 37) to troubleshoot jobs, provisioning, and requests.

## Quick pointers
- Logs API: `GET /api/logs` — query by level, time range, traceId, sessionId, orgId
- Trace view: `GET /api/logs/trace/:traceId` — single timeline for a full request/job
- Session view: `GET /api/logs/session/:sessionId` — all logs for onboarding/provisioning session
- Export: `POST /api/logs/export` — export JSON/CSV for offline analysis (admin only)

## RBAC
- `monitor:*` or `logs:read` required to query logs
- `logs:export` required to export log data
- Sensitive fields masked by default: passwords, tokens, secrets

## Example queries (curl)
- Query recent ERROR logs:
```bash
curl 'http://localhost:4000/api/logs?level=ERROR&since=1h' -b 'auth_cookie=...'
```
- Get full trace for a traceId:
```bash
curl 'http://localhost:4000/api/logs/trace/a1b2c3d4-...' -b 'auth_cookie=...'
```
- Export session logs to JSON:
```bash
curl -X POST 'http://localhost:4000/api/logs/export' -H 'Content-Type: application/json' -d '{"filter": {"sessionId":"sess-123"}, "format":"json"}' -b 'auth_cookie=...'
```

## Using logs to triage onboarding/provisioning failures
1. From onboarding status or job output, capture `sessionId` or `jobId` and `traceId`.
2. Run `GET /api/logs/trace/:traceId` — this provides the timeline across all spans.
3. Look for `ERROR` or `WARN` entries and the span/step name (e.g., `create-as2-endpoint`, `attach-template`).
4. Check adjacent spans for contextual data (e.g., upstream API timeouts or validation errors).
5. If needed, export the trace log and attach to an incident ticket with `traceId` and `sessionId`.

## Best practices
- Use `traceId` to correlate logs across services and job workers
- Do not manually unmask or log secrets; use the export facility and redact any PII before sharing
- Set alerts for: repeated provisioning failures, long-running jobs (>10 minutes), and spike in ERROR rates
- Link dashboards to traces: add `traceId`/`sessionId` links on Grafana panels for rapid triage

## Links
- Phase 37 Foundation: `docs/phases/phases31-40/phase-37-foundation.md`
- Monitoring & Metrics plan: `docs/operations/monitoring.md`
- Logs API handler: `api/handlers/logs.js`

If you'd like, I can add monitoring dashboard specs (Grafana/Datadog), alert rules, and example queries for each common failure mode (e.g., AS2 provisioning timeouts).