# February 2026 Release Notes (`release-02-2026`)

Date: February 27, 2026

## Highlights

- Phase 79 Step 2b completed: platform-security ownership moved under core Identity.
- `bf-identity` now owns:
  - BF employee admin + MFA-gated impersonation start
  - platform audit log persistence and retrieval
  - migration-first schema evolution for platform-security fields
- `bf-admin-console` now proxies platform-admin user/audit/impersonation operations to Identity.
- `bf-shipments` de-scoped from platform-security duplication for impersonation/audit responsibilities.

## Architecture Outcome

- Clear boundary enforced:
  - Identity = security state + privileged audit source of truth
  - Admin Console = gateway/proxy for internal admin operations
  - Shipments = operational TMS domain only

## Validation Snapshot

- `bf-identity`:
  - `alembic upgrade head`
  - `pytest -q tests/test_phase79_core_admin.py` → passed
- `bf-admin-console/backend`:
  - `pytest -q tests/test_phase79_proxy_identity_integration.py` → passed
- `bf-shipments` regression:
  - `pytest -q tests/test_phase78_taskc_quotes.py tests/test_day2_taska_invoices.py` → passed

## Deployment Order (Recommended)

1. Deploy `bf-identity` and run Alembic migration to head.
2. Deploy `bf-admin-console` proxy updates.
3. Deploy `bf-shipments` cleanup changes.

Operational runbook:

- `docs/operations/phase79-production-rollout-checklist.md`

## Follow-ups

- Optional: replace deprecated FastAPI `on_event` startup hooks with lifespan handlers.
- Optional: standardize warnings cleanup for datetime and dependency deprecations.
