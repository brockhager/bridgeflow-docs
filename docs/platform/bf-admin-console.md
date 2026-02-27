# Admin Console Service (`bf-admin-console`)

Internal admin interface and API proxy layer for cross-service operations.

## Status

Active (internal platform module).

## Endpoint

- https://bf-admin.up.railway.app

## Key Routes

- `POST /api/auth/login`
- `GET /api/health/all`
- `GET /api/public/resilience-status`
- `GET /api/admin/users` (proxy to Identity)
- `POST /api/admin/users` (proxy to Identity)
- `PATCH /api/admin/users/{user_id}/role` (proxy to Identity)
- `POST /api/admin/users/{user_id}/reset-password` (proxy to Identity)
- `PATCH /api/admin/users/{user_id}/deactivate` (proxy to Identity)
- `GET /api/admin/audit-logs` (proxy to Identity `/admin/platform-audit-logs`)
- `POST /api/admin/impersonation/start` (proxy to Identity `/admin/impersonation/start`)

## Security Boundary

- Admin Console is the gateway for platform-admin actions, not the owner of security state.
- Privileged user operations and platform audit data are owned by `bf-identity`.

## Repository

- https://github.com/brockhager/bf-admin-console
