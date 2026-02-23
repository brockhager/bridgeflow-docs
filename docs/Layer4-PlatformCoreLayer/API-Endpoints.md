# Layer 4 API Reference (summary)
## Firewall Security (Phase 33)
POST /api/firewalls
- Description: Create a firewall rule set for an Integration Bridge (Layer 4 security)
- Payload: `{ bridgeId, side: 'inbound'|'outbound', publicIp, allowedPorts: number[], protocol: 'tcp'|'udp'|'both' }`
- Pre-handlers: `authMiddleware`, `idempotencyMiddleware`, `requirePermission('firewalls:write')`
- Response: `201 { id, bridgeId, side, publicIp, allowedPorts, protocol, status: 'PROVISIONING'|'ACTIVE'|'ERROR' }`

GET /api/firewalls/:id
- Description: Fetch a single firewall rule set
- Pre-handlers: `authMiddleware`, `requirePermission('firewalls:read')`
- Response: `{ id, bridgeId, side, publicIp, allowedPorts, protocol, status, createdAt }`

GET /api/bridges/:bridgeId/firewalls
- Description: List all firewall rule sets for a bridge (usually 0-2)
- Pre-handlers: `authMiddleware`, `requirePermission('firewalls:read')`
- Response: `{ firewalls: [ { id, side, publicIp, allowedPorts, protocol, status, createdAt } ] }`

DELETE /api/firewalls/:id
- Description: Delete a firewall rule set (triggers async teardown; DB cascade on bridge delete)
- Pre-handlers: `authMiddleware`, `requirePermission('firewalls:delete')`
- Response: `204 No Content`

References
- Spec: [../phases/phases31-40/phase-33-firewall-api.md](../phases/phases31-40/phase-33-firewall-api.md)
- Canvas guide: [../phases/phases31-40/phase-33-firewall-canvas-integration.md](../phases/phases31-40/phase-33-firewall-canvas-integration.md)


## Audit
GET /api/audit
- Description: Query audit events
- Params: `limit`, `offset`, `jobId`, `level`, `search`, `dateFrom`, `dateTo`, `actionType`, `actorId`, `targetId`
- Permissions: `audit:read`
- Response: `{ audit: [ ... ], total, limit, offset, filters }

## User Management
GET /api/users
- Description: List users with filters/pagination
- Params: `limit`, `offset`, `role`, `search`, `disabled`
- Permissions: `users:read`
- Response: `{ users: [ ... ], total, limit, offset }

POST /api/users
- Description: Create user (admin-only)
- Payload: `{ email, name, role }` (password flow separate)
- Permissions: `users:write`

PATCH /api/users/:id/role
- Description: Change user role
- Payload: `{ role }`
- Permissions: `users:role`

PATCH /api/users/:id/enable
- Description: Enable/disable user
- Payload: `{ disabled: true|false }`
- Permissions: `users:write`

## Mapping Version Control (Layer 3 Enterprise)
GET /api/mappings
- Description: List all mappings
- Permissions: `mapping:view`
- Response: `{ success: true, mappings: [ ... ] }`

POST /api/mappings
- Description: Create new mapping
- Payload: `{ name, description }`
- Permissions: `mapping:create`
- Response: `{ success: true, mapping: { id, name, ... } }`

POST /api/mappings/:id/versions
- Description: Create new version of mapping
- Payload: `{ content, message }`
- Permissions: `mapping:version:create`
- Response: `{ success: true, version: { id, content, authorId, ... } }`

GET /api/mappings/:id/versions
- Description: List all versions for a mapping
- Permissions: `mapping:view`
- Response: `{ success: true, versions: [ ... ] }`

POST /api/mappings/:id/versions/restore
- Description: Restore a previous version (creates new version)
- Payload: `{ versionId }`
- Permissions: `mapping:version:restore`
- Response: `{ success: true, restored: { id, content, ... } }`

GET /api/mappings/:id/versions/:versionId/diff
- Description: View diff between version and latest
- Permissions: `mapping:view`
- Response: `{ success: true, diff: [ ... ] }`

## Monitoring & Alerting

## Customer API (Phase 18)

POST /api/customer/:org/api-keys
- Description: Create an API key for the given organization (owner/admin available via auth). Returns a plaintext key once at creation.
- Payload: `{ metadata?: object }` (optional metadata like name)
- Permissions: `auth required` (owner/admin role or operator)
- Response: `201 { apiKey: { id, key, metadata, createdAt } }` (key plaintext only at creation)

GET /api/customer/:org/api-keys
- Description: List API keys associated with an organization (no plaintext keys returned).
- Permissions: `auth required` (owner/admin role)
- Response: `{ apiKeys: [ { id, metadata, createdAt, revokedAt, rotatedAt } ] }

POST /api/customer/:org/api-keys/:id/revoke
- Description: Revoke an API key
- Permissions: `auth required` (owner/admin)
- Response: `200 { ok: true }`

POST /api/customer/:org/api-keys/:id/rotate
- Description: Rotate an API key (creates a new key material and updates hash, returns new plaintext key)
- Permissions: `auth required` (owner/admin)
- Response: `201 { apiKey: { id, key, rotatedAt } }`

## Ingest
POST /ingest/:customer_id/:endpoint_slug
- Description: Public ingestion endpoint for customers to POST payloads to.
- Auth: `x-api-key` header (plaintext API key generated via `/api/customer/:org/api-keys`) — keys are stored hashed using bcrypt and validated by middleware.
- Rate limiting: per-customer token-bucket implemented in Redis; env controls: `INGEST_RATE_LIMIT_PER_MIN`, `INGEST_RATE_LIMIT_WINDOW_SECONDS`, `REDIS_URL`.
- Responses:
  - `200` or `202` — accepted/processed
  - `401` — invalid or missing API key
  - `429` — rate limited
  - `500` — internal errors (rare; rate-limiter fails open on Redis outage)
- Observability: counters emitted as `ingest_requests_total` with labels `{ org_id, status: allowed|rate_limited|rejected }` to facilitate E2E verification.

## Connectors (e.g., QBO)
POST /api/qbo/sync
- Description: Trigger a QuickBooks Online (QBO) sync for the calling organization (fetch Purchase Orders and enqueue into ingest pipeline).
- Auth: `x-api-key` header (customer API key) — maps to `organizationId` via `validateCustomerApiKey`.
- Pre-handlers: rate limiting (same per-org limiting as ingest endpoints).
- Behavior: calls `syncQboPurchaseOrders(organizationId)` which fetches POs, maps to internal payloads, enqueues to `raw_payloads:<organizationId>` with `idempotencyKey` (`qbo_po:<TxnId>`), and records idempotency keys.
- Responses:
  - `200` — `{ status: 'sync completed', organizationId, enqueued: <n> }`
  - `401` — invalid API key
  - `429` — rate limited
  - `500` — sync failed
- Observability: emit `qbo.sync.enqueued_total`, `qbo.sync.failures`, and `qbo.sync.refreshes` as appropriate.

Notes on channels
- `channels` may include `webhook` objects (`{ type: 'webhook', url }`) or `email` objects (`{ type: 'email', to }`).
- Notifications are best-effort with retry/backoff; the system currently implements in-process retries and a JSON (non-delivery) transport if `SMTP_URL` is not configured.

Notes
- All admin endpoints are protected by `authMiddleware` and enforced by `requirePermission(...)` when rollout flags are enabled.
- Audit writes are performed via `writeAudit()` for alert lifecycle events (e.g., `alert.created`, `alert.triggered`, `alert.resolved`, `alert.deleted`).
GET /api/monitor/metrics
- Description: Return current platform metrics (dev sampler in-process)
- Query params: `names=system,api,jobs,db` to select subsets (optional)
- Permissions: `monitor:read`
- Response: `{ metrics: { system, api, jobs, db }, timestamp }

GET /api/monitor/alerts
- Description: List configured alert rules
- Permissions: `monitor:read`
- Response: `{ alerts: [ AlertRule ] }`

POST /api/monitor/alerts
- Description: Create an alert rule
- Payload: `{ name, metric, threshold, comparison = (gt|gte|lt|lte), channels = [ { type: 'webhook'|'email', url?, to? } ], createdBy }`
- Permissions: `monitor:write`
- Response: `201 { rule }`

DELETE /api/monitor/alerts/:id
- Description: Delete an alert rule
- Permissions: `monitor:write`
- Response: `{ ok: true }`

GET /api/monitor/events
- Description: List alert events (triggered/resolved), sorted by `triggeredAt`
- Permissions: `monitor:read`
- Response: `{ events: [ AlertEvent ] }`

POST /api/monitor/events/:id/resolve
- Description: Manually resolve an active event
- Permissions: `monitor:write`
- Response: `{ ok: true }`

Notes on channels
- `channels` may include `webhook` objects (`{ type: 'webhook', url }`) or `email` objects (`{ type: 'email', to }`).
- Notifications are best-effort with retry/backoff; the system currently implements in-process retries and a JSON (non-delivery) transport if `SMTP_URL` is not configured.

Notes
- All admin endpoints are protected by `authMiddleware` and enforced by `requirePermission(...)` when rollout flags are enabled.
- Audit writes are performed via `writeAudit()` for alert lifecycle events (e.g., `alert.created`, `alert.triggered`, `alert.resolved`, `alert.deleted`).
