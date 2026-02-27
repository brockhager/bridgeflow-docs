# IDENTITY

`bf-identity` provides authentication, token issuance, and role-based access primitives.

## Authentication

- Email/password login endpoint returning bearer JWT.
- JWT claims include user, org, role, and permission context.
- Token verification dependency used to guard protected APIs.

## Platform Admin Security

- Owns platform-level `BF_EMPLOYEE_ADMIN` controls.
- Enforces MFA-gated impersonation start (`POST /admin/impersonation/start`).
- Persists platform audit logs (`GET /admin/platform-audit-logs`) for privileged actions.

## User and Organization Model

- Organization and user persistence.
- Role storage per user with permission expansion.
- Super-admin and org-scoped access behavior.
- Tenant/security metadata maintained in Identity schema and migrations.

## Role-Based Permissions

- Role-to-permission mapping for admin, org admin, carrier viewer, and basic user.
- Permission check support for user-management operations.

## User Administration (API)

- Create user flow with role validation and scoped uniqueness checks.
- Delete user endpoint for permissioned admins.
- Seeded starter users for local/dev bootstrap.

## Operational Notes

- Migration-first schema lifecycle (Alembic) is authoritative for production.
- Startup is non-destructive; demo seed data is opt-in via `BF_IDENTITY_SEED_DEMO=true`.
