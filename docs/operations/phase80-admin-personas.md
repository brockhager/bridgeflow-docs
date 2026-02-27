# Phase 80 Admin Personas Guide

Date: February 27, 2026

## Objective

Enable secure dual-persona admin behavior:

- `BF_EMPLOYEE_ADMIN` → platform scope
- `ORG_ADMIN` → tenant scope

With strict boundary guarantees and no cross-tenant leakage.

## Persona Model

## Platform Admin (`BF_EMPLOYEE_ADMIN`)

- Can access platform audit and impersonation workflows.
- Uses platform dashboard/navigation context.
- Operates across tenants only through explicitly authorized controls.

## Customer Admin (`ORG_ADMIN`)

- Can manage users only within their own tenant.
- Can view only tenant-scoped audit history.
- Cannot access platform impersonation or platform admin routes.

## Hybrid Users

- Users that have both roles can switch UI context using the header toggle.
- Context switch changes navigation and available actions without changing auth token.

## Backend Security Boundaries

Implemented in `bf-identity`:

- Customer guard validates:
  - `ORG_ADMIN` role
  - valid tenant context from claims (`tenant_id`/`org_id`)
- BF employee guard validates explicit employee role/flag.
- Tenant-scoped endpoints:
  - `GET /api/v1/admin/organization/users`
  - `POST /api/v1/admin/organization/users`
  - `PUT /api/v1/admin/organization/users/{user_id}`
  - `GET /api/v1/admin/organization/audit-logs`
- Platform impersonation remains employee-only:
  - `POST /admin/impersonation/start` returns `403` for non-BF users.

## Frontend Behavior

Implemented in `bf-admin-console`:

- Auth context derives and stores:
  - `role`
  - `is_bf_employee`
  - `tenant_id`
  - persona mode (`platform` vs `org`)
- Dynamic layout switcher:
  - Platform layout nav: Tenant Management, Global User Search, Platform Audit Logs, Impersonation Tool
  - Org layout nav: My Team, Organization Settings, Billing, Org Audit Logs
- UI safety controls:
  - Impersonation navigation hidden in org layout
  - Org user creation/update flows do not expose cross-org selection

## Validation Suite

- `bf-identity/tests/test_phase80_customer_scope_isolation.py`
- `bf-identity/tests/test_phase80_privilege_escalation.py`
- `bf-admin-console/backend/tests/test_phase80_ui_rendering.py`

## Operational Notes

- Deploy Identity before Admin Console for endpoint compatibility.
- Confirm tenant-scoped endpoint responses during smoke verification.
- Include impersonation-denial verification for org admins in release gates.
