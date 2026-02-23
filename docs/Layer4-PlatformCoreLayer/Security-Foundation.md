# Security Foundation — Layer 4

Summary
- RBAC-first approach with roles → permission mapping.
- Audit-first event model: all high-value changes write audit entries.
- Token-based auth (JWT) and rollout flags control enforcement (`REQUIRE_AUTH`, `ENFORCE_RBAC`, `LOCKDOWN_JOBS`).

Key Files
- Implementation: `api/lib/rbac.js`, `api/handlers/auth.js`, `api/handlers/audit.js`, `api/lib/audit.js`
- Mock DB support for tests: `api/lib/mockDb.js`

Roles & Permissions
- Roles: `user`, `operator`, `admin` (mapped to a set of permissions)
- Permissions include: `jobs:read|write|retry|status`, `bridges:read|write|delete|test`, `firewalls:read|write|delete`, `audit:read|write`, `users:read|write|role`.

Audit
- Use `writeAudit({ request, message, meta, jobId, level })` to add events.
- GET `/api/audit` supports filters: `search`, `dateFrom`, `dateTo`, `actionType`, `actorId`, `targetId`, `jobId`, `level`, `limit`, `offset`.

Rollout Flags
- `REQUIRE_AUTH` — enforce global auth
- `ENFORCE_RBAC` — make `requirePermission` enforced
- `LOCKDOWN_JOBS` — require auth for `/api/jobs*`

Phase 17 updates
- RBAC hardening: DB-backed permission lookup is defensive — on DB errors we now fallback to token-derived role permissions (returns 403 when appropriate rather than 500). See `api/lib/rbac.js` for details.
- Dev-stub token behavior: `dev-access-token` grants an explicit admin-like user when `BRIDGEFLOW_ENV=development` or `BRIDGEFLOW_DEV_ADMIN=true` to enable local dev flows while preserving RBAC behavior.
- Mock DB: `api/lib/mockDb.js` supports missing RBAC tables and synthetic `userOrganization` owner fallbacks for tests.

Phase 18 planned items
- Customer API keys: store hashed keys (bcrypt), rotate/revoke, and expose create/list endpoints under `/api/customer/:org/api-keys` (owner/admin endpoints).
- Ingest Router: `/ingest/:customer_id/:endpoint` will accept POSTed payloads authenticated with `x-api-key` header and will be rate-limited per-customer (Redis token-bucket style) with metrics instrumented.
- Rate limiting: Redis-backed runtime; fail-open behaviour for Redis outages and metrics instrumentation to observe allowed/rate_limited events.

Phase 33 additions (Firewall Security)
- Firewall endpoints available under Layer 4 for rule management (create/read/list/delete) with RBAC and tenancy enforcement.
- Idempotency integrated on firewall creation to prevent duplicate provisioning requests.
- See Phase 33 docs: [../phases/phases31-40/phase-33-firewall-api.md](../phases/phases31-40/phase-33-firewall-api.md) and [../phases/phases31-40/phase-33-firewall-canvas-integration.md](../phases/phases31-40/phase-33-firewall-canvas-integration.md)

Dev verification
- Start a secure dev server (script references in repo) and run `pnpm -s test`. Ensure RBAC tests (both in-memory mock and DB-backed) pass and that fallback paths are exercised in unit tests.
