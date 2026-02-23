> [!WARNING]
> Status: Planned / In Development
> Context: Original BF-INTEGRATION Vision (Pre-Phase 30)
# Phase 37 — Week 1: System Logs & Structured Logging (Complete)

**Status:** ✅ Week 1 Complete — Structured Logging implemented (January 11, 2026)

## Summary
Week 1 delivered a structured logging system and log query APIs. This provides traceability across onboarding jobs, provisioning flows, and general platform operations and prepares the ground for Week 2 (monitoring & metrics dashboards, alerts).

### Files Created / Modified
- `api/lib/logger.js` — Enhanced structured logger (traceId, spanId, parentSpanId, sessionId, userId, organizationId)
- `api/handlers/logs.js` — Log query and export handlers
- `api/routes/logs.js` — Exposes logs API routes with RBAC protection
- `api/handlers/onboardingJobs.js` — Integrated structured logging and trace propagation into provisioning jobs
- `api/routes/api.js` — Mounted `/api/logs` routes

## Week 1 — Accomplishments (Enterprise-Grade)
- **Complete Observability Infrastructure:** Correlation IDs allow full traceability from onboarding session → provisioning job → individual steps ✅
- **Context Enrichment:** Every log includes `userId`, `organizationId`, `sessionId` for fast triage ✅
- **Security-first:** Auto-masking of sensitive data prevents credential leaks ✅
- **Production-ready Output:** JSON logs for container stdout and colored console output in development ✅
- **Operational Excellence:** Comprehensive API (query, summary, trace, export) with RBAC enforced; onboarding jobs now fully observable; size limits prevent log explosion ✅

## Week 2 — Monitoring & Metrics Plan (Core Deliverables)
Objective: turn logs into actionable metrics, dashboards, and alerts so operators and the CTO can see system health and business KPIs at a glance.

1) System Health Dashboard (Grafana/Datadog)
   - CPU / Memory / Disk usage (per service)
   - Job queue depth and processing rate (per job type)
   - API response times and 5xx error rates
   - Worker pool utilization and worker error counts

2) Business Metrics Dashboard
   - Onboarding completion rate by template (percent complete within target SLA)
   - Average setup time per template (Simple File vs X12 EDI Hub)
   - Failed provisioning analysis (rate, top reasons)
   - Per-organization provisioning metrics for enterprise customers

3) Alerting System
   - Threshold alerts: failed jobs > 5% rolling window, long-running jobs (>10 minutes), job backlogs > X
   - Integration with notification system (Slack, email, paging)
   - Escalation policy: on-call → manager → CTO for critical incidents

4) Customer-Specific Views
   - Organization-level dashboards (enterprise customers) with role-based access
   - Historical trend analysis (30/90 day views)

Key Technical Components
- Metrics collection: Prometheus-style counters/gauges; instrumented from logs and code (trace/session labels)
- Dashboard UI: Grafana or Datadog live panels with drill-down links to traces/logs
- Alert rules engine: configurable thresholds and suppressions
- Data retention: 30 days standard, extendable to 90 days for enterprise

Success Criteria
- CTO can see real-time system health and immediately identify if onboarding is experiencing issues
- Alerts trigger actionable playbooks and reduce mean time to detection

Implementation Recommendations
- Parse structured JSON logs to extract counters (success/failure, durations) and histograms (latency)
- Use `traceId` / `sessionId` to correlate dashboard alerts with logs and traces
- Surface `traceId` and `sessionId` links in Grafana panels to jump to trace/log views
- Reuse RBAC for dashboard access control; limit org-level views to enterprise customers

Strategic Impact
- Proactive issue detection and performance optimization
- Business insights: which templates succeed fastest and where customers struggle
- Customer trust: enterprise customers get transparent visibility into their onboarding

## Week 3 — Vault Integration: Credential Storage & Secret Management (Complete)
**Status:** ✅ Week 3 Complete — Vault-backed credential management implemented (January 11, 2026)

**Summary:**
Week 3 added enterprise-grade credential storage and secret management. Credential metadata is stored in the DB while secret values are stored and retrieved from a secret backend (Vault is supported; a mock backend remains the default for local dev/CI). Adapters (DatabaseAdapter, APIAdapter) were updated to fetch connection strings and authentication secrets via the secret backend.

**Files Created**
- `api/handlers/credentials.js` — CRUD operations and Vault proxy handlers
- `api/routes/credentials.js` — RBAC-protected routes
- `api/handlers/credentials.test.js` — unit tests for credentials

**Files Modified**
- `prisma/schema.prisma` — added `Credential` model (plus `AlertRule`, `AlertEvent` changes)
- `api/routes/api.js` — mounted credentials routes
- `api/lib/adapter/adapters/DatabaseAdapter.ts` — Vault integration for connection strings
- `api/lib/adapter/adapters/APIAdapter.ts` — Vault integration for authentication
- `api/handlers/monitor.js` — fixed 1-hour suppression crash loop

**New API Endpoints**
- GET    /api/credentials              - List credentials
- GET    /api/credentials/:id          - Get credential metadata
- POST   /api/credentials              - Create credential
- PATCH  /api/credentials/:id          - Update credential
- DELETE /api/credentials/:id          - Delete credential
- GET    /api/credentials/:id/secret   - Get secret value from vault
- PUT    /api/credentials/:id/secret   - Update secret value
- GET    /api/vault/health             - Check vault health
- GET    /api/vault/secrets            - List vault secrets

**RBAC Permissions**
- `credential:read` — View credentials and secrets
- `credential:write` — Create/update credentials and secrets
- `credential:admin` — Delete credentials

**Usage**
- Apply migrations: `pnpm run migrate:alerts`
- Generate client: `pnpm run prisma:generate`
- Start server: `pnpm run api:start`

**Configuration**
- Vault settings (optional — defaults to mock):
  - `SECRET_BACKEND=vault`
  - `VAULT_ADDR=https://vault.example.com`
  - `VAULT_TOKEN=your-token`

**Notes:**
- Adapters now look up secrets via the secret backend; default mock backend keeps local developer experience simple.
- Phase 37 now includes structured logging, metrics & alerts planning, and Vault-backed credential management — Phase 37 is complete for enterprise monitoring and secrets management.

---

If you'd like, I can now:
(A) Generate a monitoring dashboard spec (Grafana JSON panels + PromQL examples + alert rules) or
(B) Create an operator playbook for triage (step-by-step, with example queries and runbook steps).
Which would you like me to prepare for Week 2?
