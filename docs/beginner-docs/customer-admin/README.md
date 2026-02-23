# Customer Admin Quick Start

This short guide is for customer administrators who manage organization settings and blueprints.

Quick tasks for customer admins:
- Access admin UI: the Admin console is available at the deploy-specific URL. In dev, use the admin dev routes under `/admin-api/*`.
- Seed test data: call `POST /admin-api/_dev/ensure-dev-seed` to create sample blueprints and test orgs (dev-only endpoint). Note: some dev-only accounts created by this endpoint are internal to the BridgeFlow team and not intended for customer use.
- Manage blueprints and packages: see `api/handlers/packages.js` and the phase docs in `docs/phases/`.

Permissions & safety:
- Admin operations require appropriate roles/permissions (RBAC enforced by `api/lib/rbac.js`).
- Don’t use `BRIDGEFLOW_DEV_ADMIN` for production-like testing as it may bypass real auth.

Where to learn more:
- Blueprints & package activation: `docs/phases/phases21-30/phase-28.md`
- RBAC implementation: `api/lib/rbac.js`
