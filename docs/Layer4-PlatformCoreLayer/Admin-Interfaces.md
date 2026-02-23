# Admin Interfaces — Audit, Users & Monitoring

Overview
This document summarizes the admin UI pieces implemented for Layer 4.

Audit UI (`web/admin/audit.html` + `web/src/admin/audit.js`)
- Features: filters (jobId, level, actionType, actor, date range), search, pagination, CSV export
- Accessibility: announcements (live region) for filters, search, pagination, and export
- Permissions: visible only to users with `operator` role; requires `audit:read` to access API

Users UI (`web/admin/users.html` + `web/src/admin/users.js`)
- Features: list users, search by email, filter by role/status, pagination, create user modal, change role modal, enable/disable controls
- RBAC: modification (role change, enable/disable, create) restricted to `admin`; role views visible to `operator`
- Audit: all user modifications record an audit event via `writeAudit`

Monitoring UI (`web/admin/monitor.html` + `web/src/admin/monitor.js`)
- Features:
  - Metrics dashboard (CPU, memory, API p50/p95, jobs success rate, DB query time)
  - Alert rule management: create, list, delete rules (modal for create)
  - Events: active triggered events, manual resolve, and history view
  - Notifications: alerts can be configured with `webhook` or `email` channels
- Accessibility: ARIA live-region announcements on create/delete/resolve actions; modals are keyboard accessible and closable with Escape
- RBAC & visibility: UI visible to `operator` and `admin` roles; write actions (create/delete/resolve) require `monitor:write` permission
- Tests: `web/tests/admin.monitor.test.js` covers rendering, modal flow, events resolution and accessibility behaviors

Testing
- API tests: `api/tests/monitor.test.js` (metrics endpoint, alert create/list/delete, evaluation triggers)
- API tests: `api/tests/notify.test.js` (notification retry/backoff behavior)
- UI tests: `web/tests/admin.monitor.test.js` (jsdom)

Notes
- The evaluator runs in-process by default; for HA consider running the evaluator in a single leader or separate worker to avoid duplicate alert notifications.
