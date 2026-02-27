# Phase 79 Production Rollout Checklist

Date: February 27, 2026  
Scope: `bf-identity`, `bf-admin-console`, `bf-shipments`

This runbook is the production deployment checklist for Phase 79 security-centralization changes.

## 0) Change Summary

- Identity is the source of truth for platform impersonation, MFA gating, and platform audit logs.
- Admin Console proxies privileged platform-admin operations to Identity.
- Shipments no longer owns platform-level impersonation/audit behavior.
- Identity schema changes are migration-first and additive.

## 1) Pre-Deployment Preconditions

- [ ] Confirm approved release artifacts for all three services:
  - [ ] `bf-identity` image/tag
  - [ ] `bf-admin-console` image/tag
  - [ ] `bf-shipments` image/tag
- [ ] Confirm production secrets are present and valid:
  - [ ] `DATABASE_URL` (Identity)
  - [ ] `BF_JWT_SECRET` / `JWT_SECRET` consistency for token parsing paths
  - [ ] `BF_IDENTITY_URL` in Admin Console points to production Identity
- [ ] Confirm `BF_IDENTITY_SEED_DEMO` is **not enabled** in production.
- [ ] Take a database backup/snapshot before migration.
- [ ] Announce maintenance/change window and rollback window.

## 2) Database Migration Strategy (Identity First)

### 2.1 Run migration before new app code is promoted

- [ ] Execute Identity Alembic migration to head in production.
- [ ] Record migration output and revision marker.

Example:

```bash
alembic upgrade head
```

### 2.2 Verification Gate: schema readiness

Run checks before any service restart:

- [ ] `organizations.tenant_status` exists
- [ ] `organizations.subscription_tier` exists
- [ ] `organizations.feature_flags_json` exists
- [ ] `users.mfa_enabled` exists
- [ ] `users.mfa_verified_at` exists
- [ ] `platform_audit_logs` table exists
- [ ] `platform_audit_logs` indexes exist (`event_type`, `action_scope`, `actor_user_id`, `target_user_id`, `created_at`)

Suggested SQL checks (Postgres style):

```sql
SELECT column_name FROM information_schema.columns
WHERE table_name='users' AND column_name IN ('mfa_enabled','mfa_verified_at');

SELECT to_regclass('public.platform_audit_logs');
```

**Gate rule:** Do not continue until all required schema objects are present.

## 3) Service Restart / Deployment Order

Order is critical to avoid dependency and auth failures.

1. **`bf-identity`** (first)
2. **`bf-admin-console`** (second)
3. **`bf-shipments`** (third)

Rationale:

- Admin Console depends on Identity admin endpoints (`/admin/impersonation/start`, `/admin/platform-audit-logs`, `/users*`).
- Shipments cleanup is boundary enforcement; bringing it after Identity/Admin avoids mixed ownership windows.

## 4) Stage Gates and Smoke Tests

## Gate A — after Identity deploy

- [ ] `GET /health` returns 200 from Identity.
- [ ] Admin login still succeeds (`POST /auth/login`).
- [ ] Token contains expected auth context.
- [ ] Impersonation endpoint responds for BF employee admin with MFA:
  - [ ] `POST /admin/impersonation/start` returns 200 for valid request.
- [ ] Platform audit retrieval works:
  - [ ] `GET /admin/platform-audit-logs` returns 200.

## Gate B — after Admin Console deploy

- [ ] `GET /api/health/all` from Admin Console returns healthy Identity dependency.
- [ ] Proxy user-management routes work via Admin Console.
- [ ] `POST /api/admin/impersonation/start` proxies successfully to Identity.
- [ ] `GET /api/admin/audit-logs` proxies successfully to Identity.

## Gate C — after Shipments deploy

- [ ] Shipments health endpoint returns 200.
- [ ] Core shipment flows are unaffected (create/update/track).
- [ ] Quote/invoice critical path smoke tests pass.
- [ ] No platform-admin impersonation behavior is expected from Shipments APIs.

## 5) Rollback Plan

## 5.1 Rollback principles

- Prefer **application rollback with migrated schema kept in place** (additive migration is backward-compatible in normal cases).
- Avoid immediate DB downgrade in incident mode unless explicitly required.
- Protect audit data: do not drop `platform_audit_logs` during emergency rollback.

## 5.2 If Identity fails after migration

1. [ ] Put Admin Console privileged actions in maintenance mode (or restrict admin operations).
2. [ ] Roll back **Identity application** to last known-good compatible artifact.
3. [ ] Re-run Identity health + login smoke tests.
4. [ ] Keep DB at migrated revision unless incompatibility is proven.

## 5.3 If incompatibility requires full rollback

1. [ ] Freeze writes to affected admin/security endpoints.
2. [ ] Export new `platform_audit_logs` rows created since deployment (for forensic retention).
3. [ ] Restore pre-deploy DB snapshot.
4. [ ] Roll back Identity/Admin Console/Shipments to pre-Phase-79 bundle.
5. [ ] Verify admin login and pre-change operational baseline.

## 5.4 Admin lockout contingency

- [ ] Maintain at least one break-glass super-admin credential path.
- [ ] Verify direct Identity login path independent of Admin Console proxy.
- [ ] Document on-call owner for emergency credential/JWT secret recovery.

## 6) Post-Deployment Verification (Final Go/No-Go)

- [ ] Identity, Admin Console, Shipments health checks all green.
- [ ] End-to-end impersonation via Admin Console succeeds.
- [ ] Corresponding platform audit log entry is persisted and queryable.
- [ ] Standard shipment workflows pass smoke checks.
- [ ] Error budget/alerts stable for 30–60 minutes after cutover.

## 7) Operational Logging and Evidence Capture

- [ ] Save migration logs and schema check output.
- [ ] Save smoke-test command output for each gate.
- [ ] Save final deployment timestamps and image tags.
- [ ] Attach evidence links in release notes / incident tracker.

## 8) Quick Command Checklist

```bash
# Identity migration
alembic upgrade head

# Identity smoke
curl -sf https://bf-identity.up.railway.app/health

# Admin Console smoke
curl -sf https://bf-admin.up.railway.app/api/health/all

# Shipments smoke
curl -sf https://bf-shipments.up.railway.app/health
```

Use authenticated requests for impersonation and audit-log endpoint verification during Gate A/B.
