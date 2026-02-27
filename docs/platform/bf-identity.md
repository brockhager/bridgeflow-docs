# Identity Service (`bf-identity`)

Authentication and authorization service for JWT issuance, user management, org scoping, and platform-level admin security controls.

## Status

Active.

Phase 79 Step 2b complete (Feb 2026): platform impersonation + platform audit ownership centralized in Identity.

## Endpoint

- https://bf-identity.up.railway.app

## Key Routes

- `POST /auth/login`
- `GET /health`
- `POST /users`
- `GET /users`
- `PATCH /users/{user_id}/roles`
- `POST /users/{user_id}/reset-password`
- `PATCH /users/{user_id}/deactivate`
- `POST /admin/impersonation/start`
- `GET /admin/platform-audit-logs`

## Security Ownership

- Identity is the system of record for `BF_EMPLOYEE_ADMIN` + MFA-gated impersonation.
- Identity stores platform audit logs for privileged admin actions.
- Startup is migration-first and non-destructive; demo seeding is gated by `BF_IDENTITY_SEED_DEMO=true`.

## Repository

- https://github.com/brockhager/bf-identity
