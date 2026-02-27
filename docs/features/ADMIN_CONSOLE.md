# ADMIN CONSOLE

`bf-admin-console` provides authenticated operational controls and super-admin management views.

## Authentication and Access

- Login flow with protected routes for private dashboards.
- Auth-aware app shell with public and private route separation.
- Super-admin visibility controls for privileged tools.

## Admin Integration Management

- Coords tenant/API key configuration.
- Toggle controls for live tracking, auto-sync, and geofence push.
- Sync interval management.
- Connection testing and force-sync actions.
- Recent sync error surfacing from audit logs.

## Admin User Management

- User list and role management workflows.
- Password reset/deactivate patterns via backend proxies.
- Super-admin tools isolated from non-admin users.
- User management proxies route to Identity (`/users*`) as source of truth.
- Platform impersonation start and audit-log retrieval proxy to Identity admin endpoints.

## Operational Dashboards

- Private dashboard entry point for internal operators.
- Public resilience view page for externally visible status context.
- Control tower case view integration points.

## Service Boundary

- Admin Console orchestrates cross-service admin actions.
- Identity owns platform-security data and privileged audit records.
