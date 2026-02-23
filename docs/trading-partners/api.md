# Trading Partner API

This document lists the principal API endpoints for trading partner operations.

Public (customer-scoped)
- GET /api/tp/:id/profile
  - Auth: customer API key (cookie-based or X-API-Key via `validateCustomerApiKey`)
  - Behavior: returns a read-only profile for the TP if it belongs to the requesting organization. 401 when org context missing; 404 if not found or cross-tenant.
  - Response: `{ profile: { id, name, organizationId, status, createdAt, updatedAt, metadata } }`

- GET /api/tp/:id/profile/aggregate
  - Aggregates connection-level data (Phase 21B): QBO realm presence, partner API key count, delivery method, CSV summary (mock S3 only), etc.
  - Response: `{ aggregated: { id, name, organizationId, qbo: { connected, realmId? }, partnerApiKeyCount, deliveryMethod, csv: { uploadedFiles? } } }`

Partner-facing (partner auth, not customer keys)
- POST /partner/:partnerId/invoice
  - PreHandler: `validatePartnerApiKey` (X-Partner-Key header)
  - Accepts invoice JSON from partners and enqueues to `partner_inbound:<orgId>` stream (Redis) and stores CSV in inbox (`inbox/<orgId>/*.csv`) for visibility.
  - Idempotency: supports idempotency headers; server will generate an idempotency key when missing.
  - Returns: 202 Accepted with `{ status: 'accepted', inbox_key }` on success.

Admin (require `admin:partners:manage` permission)
- POST /api/admin/partner — create partner and API key (returns raw key once)
- GET /api/admin/partner — list partners
- DELETE /api/admin/partner/:id/key — revoke partner key

Notes:
- All customer-scoped endpoints enforce RLS: `organizationId` must match the request context populated by middleware.
- For connection-specific operations (e.g., QBO sync), the code uses per-organization encrypted `IntegrationCredential` rows and will decrypt when needed to fetch realm or tokens for display.
- See `docs/trading-partners/integrations.md` for integration-specific behavior and sample payloads.