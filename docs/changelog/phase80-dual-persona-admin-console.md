# Phase 80 Changelog — Dual-Persona Admin Console

Date: February 27, 2026

## Summary

Phase 80 introduces secure dual-persona administration across BridgeFlow Identity and Admin Console.

- `BF_EMPLOYEE_ADMIN` persona: platform-scoped administration and impersonation tooling.
- `ORG_ADMIN` persona: tenant-scoped user and audit management.
- Hybrid users can switch context in UI without changing tokens.

## Repositories Updated

## bf-identity

### Added

- `dependencies.py`
  - `is_bf_employee_admin(current_user)`
  - `is_customer_admin(current_user)`

- `tests/test_phase80_customer_scope_isolation.py`
- `tests/test_phase80_privilege_escalation.py`

### Changed

- `main.py`
  - Added tenant context in auth user payload (`tenant_id`).
  - Added guarded dependency wrappers:
    - `get_bf_employee_admin_user`
    - `get_customer_admin_user`
  - Hardened impersonation and platform audit routes to BF employee guard.
  - Added tenant-scoped org admin APIs:
    - `GET /api/v1/admin/organization/users`
    - `POST /api/v1/admin/organization/users`
    - `PUT /api/v1/admin/organization/users/{user_id}`
    - `GET /api/v1/admin/organization/audit-logs`
  - Enforced org role ceiling and tenant immutability in org admin operations.

## bf-admin-console

### Backend (`backend/routes/proxy.py`)

Added org admin proxy routes:

- `GET /api/admin/organization/users`
- `POST /api/admin/organization/users`
- `PUT /api/admin/organization/users/{user_id}`
- `GET /api/admin/organization/audit-logs`

### Frontend

#### Added

- `frontend/src/components/LayoutSwitcher.jsx`
- `frontend/src/pages/OrgUsersPage.jsx`
- `frontend/src/pages/OrgAuditLogsPage.jsx`
- `frontend/src/pages/OrgSettingsPage.jsx`
- `frontend/src/pages/OrgBillingPage.jsx`
- `frontend/src/pages/PlatformAuditLogsPage.jsx`
- `frontend/src/pages/ImpersonationToolPage.jsx`

#### Changed

- `frontend/src/context/AuthContext.jsx`
  - Added derived auth context fields (`role`, `is_bf_employee`, `is_org_admin`, `tenant_id`).
  - Added persona state (`platform`/`org`) and hybrid context switching.

- `frontend/src/App.jsx`
  - Replaced `/dashboard` body with `LayoutSwitcher`.
  - Added platform/org persona routes and persona access guards for direct URL protection.

- `frontend/src/services/adminIntegrationApi.js`
  - Added organization-scoped API clients for users and audit logs.
  - Added impersonation session client (`startImpersonationSession`).

- `frontend/src/pages/AdminUsersPage.jsx`
  - Added per-user `Impersonate` action.
  - Applies returned impersonation token and redirects to dashboard.

### Added Tests

- `backend/tests/test_phase80_ui_rendering.py`
- `frontend/playwright.config.ts`
- `frontend/tests/e2e/test_phase80_dual_persona_flow.spec.ts`

## bridgeflow-docs

### Added

- `docs/operations/phase80-admin-personas.md`
- `docs/changelog/phase80-dual-persona-admin-console.md`

### Changed

- `mkdocs.yml`
  - Added navigation entry for Phase 80 persona operations guide.
  - Added `Changelog` section and linked this changelog page.

## Security and Boundary Outcomes

- Org admins are limited to tenant-scoped user and audit operations.
- Org admins are blocked from platform impersonation and platform audit APIs.
- Privilege escalation via `tenant_id` rewrite or platform role assignment is rejected.
- BF employee impersonation remains MFA-gated.

## Validation Results

Executed on February 27, 2026:

- `bf-identity` targeted tests: **6 passed**
  - Includes Phase 80 isolation/escalation tests plus Phase 79 regression.
- `bf-admin-console` backend tests: **4 passed**
  - Includes Phase 80 UI contract checks plus Phase 79 integration regression.
- `bf-admin-console/frontend` build: **successful** (`vite build`).
- `bf-admin-console/frontend` Playwright E2E: **4 passed** (`npm run e2e`)
  - BF employee platform view + impersonation redirect/token update.
  - Customer admin org-only navigation and platform route denial via redirect.
  - Tenant A My Team UI isolation (no Tenant B users rendered).
  - Hybrid user context switch (platform ↔ org) with privileged menu visibility changes.

## Deployment Notes

- Deploy `bf-identity` first.
- Deploy `bf-admin-console` second.
- Verify:
  - Org admin cannot access `/admin/impersonation` or platform audit endpoints.
  - Org admin user list and audit log responses are tenant-scoped only.
  - Hybrid user context switch changes available navigation/actions correctly.