> [!WARNING]
> Status: Planned / In Development
> Context: Original BF-INTEGRATION Vision (Pre-Phase 30)
# Admin Bridgeflow Architecture

This document gives a high-level overview of the Admin Bridgeflow architecture and component interactions.

## Components

- Admin UI (admin-bridgeflow)
  - React + Vite app served as static assets (by the main `api` server in dev)
  - Pages: Tenant list, APIMetrics, Operations

- API Server (api/)
  - Fastify-based server exposing admin endpoints (prefixed with `/admin-api/` and protected by IP whitelist and RBAC)
  - Key handlers: `adminAccountManagement`, `adminImpersonate`, `adminMetrics`, `adminTenants`

- Persistence & Stores
  - Production: Prisma + Postgres
  - Tests/dev: `api/lib/mockDb.js` in-memory mock
  - Optional: Redis for rate-limits and metrics persistence (code paths allow absence of Redis)

- Observability
  - `api/lib/metrics.js` and `api/lib/metricsPlugin.js` collect per-request metrics used by the APIMetrics dashboard
  - Alerts are derived from metrics thresholds and surfaced in the admin UI

- Security
  - RBAC decorators (`api/lib/rbac.js`) guard endpoints using fine-grained permissions
  - Optional mTLS plugin (`api/lib/mtls.js`) to require mutual TLS for admin API traffic
  - Audit logging (`api/lib/audit.js`) records admin actions

## Data flows (simplified)

1. Operator uses Admin UI to perform an action (e.g., "Suspend Organization").
2. UI calls protected endpoint (e.g., POST `/admin-api/tenants/:id/suspend`) with admin JWT.
3. Server validates IP/mTLS and RBAC, writes audit log, updates DB (Prisma), triggers notifications (email), and modifies runtime flags (e.g., processingPaused).
4. Metrics plugin records the request and updates in-memory metrics; clear/flush operations reset metrics on resume.

## Developer notes
- Keep admin route handlers idempotent and ensure `reply.status(200).send(...)` on successful paths (tests rely on this behavior).
- Avoid importing heavy client-side assets (JSX/HTML) inside server-loaded modules—Vitest/Vite import analysis can fail on unexpected content.
- Use `test/setup.js` to clear `mockDb` and in-memory metrics to avoid cross-test leakage.


