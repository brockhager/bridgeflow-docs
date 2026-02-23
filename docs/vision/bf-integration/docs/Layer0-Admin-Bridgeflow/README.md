> [!WARNING]
> Status: Planned / In Development
> Context: Original BF-INTEGRATION Vision (Pre-Phase 30)
# Layer0 - Admin Bridgeflow ✅

Quick orientation: the Admin Bridgeflow module is the full-featured administrative console and API set used by BridgeFlow operators and support staff to manage tenants, monitor system health, and perform emergency or corrective actions.

## What it is

- A small admin web app (admin-bridgeflow) that communicates with protected admin-only API endpoints.
- A set of server-side handlers and utilities in `api/handlers/*` and `api/lib/*` that expose admin operations (impersonation, account management, metrics, emergency controls, rate-limit management, audits).
- Designed for operational users (support, SRE, product ops) to safely manage customers and the system.

## Core capabilities

- Tenant / User Management
  - View and search tenants
  - "Login As" / impersonate customer users for troubleshooting
  - Suspend / Reactivate organization accounts (with audit & email notifications)
  - Manual organization data correction with rollback metadata

- Operational Tools
  - Job monitoring and control (list jobs, inspect status, retry)
  - API metrics and health dashboard (p50/p95/p99, request volume, alerts)
  - Clear caches (metrics, Redis) and emergency global pause/resume

- Security & Audit
  - RBAC-protected endpoints (`requirePermission(...)` granular permission strings)
  - Audit trail writes for admin actions
  - IP whitelist + optional mTLS for admin traffic

## Where to look (key files)

- Admin frontend: `admin-bridgeflow/src/pages/*` (Tenant list, APIMetrics, Operations)
- Admin handlers: `api/handlers/admin*` (adminAccountManagement, adminImpersonate, adminMetrics, adminTenants)
- Metrics: `api/lib/metrics.js`, `api/lib/metricsPlugin.js`
- Mock DB & tests: `api/lib/mockDb.js`, `test/admin.*.test.js`
- Security: `api/lib/rbac.js`, `api/lib/mtls.js`, `docs/admin-bridgeflow/security.md`

## Current test & release status (Phase 13)

- Admin features: implemented and covered by unit tests (admin account tests, impersonation, metrics) ✅
- Known test blockers (deferred to Phase 14):
  - `api/tests/users.test.js` (Vite transform failure)
  - `api/tests/worker.integration.test.js` (process-level memory explosion during full-suite runs)
- For Phase 13 gating we are excluding those two failing tests to validate admin readiness while we schedule a focused Phase 14 fix pass.

## Demo readiness

- Operational scenarios validated:
  - Admin login and MFA (dev stub available)
  - Tenant search & impersonation
  - Suspend → Reactivate customer (with email + audit)
  - Health & Metrics dashboard
  - Emergency global pause → resume
- Preparation checklist: see `CHECKLIST.md` for the step-by-step demo script and acceptance criteria.

---

## Additional docs
- [Demo checklist](./CHECKLIST.md) — step-by-step CTO demo checklist and acceptance criteria ✅
- [Architecture overview](./ARCHITECTURE.md) — system components and dataflows 🔧
- [CLI / API cheatsheet](./CLI-CHEATSHEET.md) — curl snippets for common admin calls 🔗
- [Demo script](./DEMO-SCRIPT.md) — ordered demo steps and example payloads 🎤
- [CTO 10-minute quickstart](./CTO-ONLY-QUICKSTART.md) — 10-minute verification checklist (CTO-focused)
- [Schedule & Next Steps](./SCHEDULE.md) — proposed demo time + pre-demo checklist 📅
- [Known issues](./KNOWN-ISSUES.md) — test blockers and mitigation plan ⚠️
- [Security notes](../admin-bridgeflow/security.md) — admin-specific security considerations 🔐

If you'd like anything added (SVG diagram, CLI examples expanded, or a one-page quick-reference PDF), tell me which item and I'll add it.
