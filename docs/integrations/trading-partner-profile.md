# Trading Partner Profile (Phase 21A)

This document describes the read-only Trading Partner Profile API (Phase 21A).

## Endpoint
- GET /api/tp/:id/profile
- Auth: requires `X-API-Key` (customer API key) — maps to `organizationId` via `validateCustomerApiKey` middleware.

## Behavior & RLS
- The endpoint **enforces organization scoping** by only returning a TP when `tradingPartner.organizationId === req.customerOrgId`.
- If `req.customerOrgId` is missing: 401 Unauthorized
- If TP not found or belongs to a different organization: 404 NOT_FOUND

## Response
- 200 OK
```
{ "profile": { id, name, organizationId, status, createdAt, updatedAt, metadata } }
```

## Usage example
```
curl -X GET https://api.local.test/api/tp/tp-123/profile -H "X-API-Key: <org-key>"
```

## Notes
- This is read-only aggregation; no new tables were added.
- Connection profiles (Phase 21B) will be added separately and return connection-specific data (QBO realm, partner delivery method, inferred CSV summary).

## Phase 21B — Connection aggregation
- GET /api/tp/:id/profile/aggregate
- Auth: requires `X-API-Key` (customer API key)
- Returns an aggregated view including:
  - `qbo`: { connected: boolean, realmId?: string }
  - `partnerApiKeyCount`: number of partner API keys for this partner
  - `deliveryMethod`: inferred from `tradingPartner.credentials` or `metadata`
  - `csv`: { uploadedFiles: number } — counts files uploaded to S3 inbox (only available when S3 is mocked locally)

Example response:
```
{ "aggregated": { "id": "tp-1", "name": "TP", "organizationId": "org-1", "qbo": { "connected": true, "realmId": "realm-123" }, "partnerApiKeyCount": 2, "deliveryMethod": "email", "csv": { "uploadedFiles": 3 } } }
```

Notes:
- QBO credentials are stored encrypted in `IntegrationCredential.encryptedData` and are decrypted to obtain `realmId` for display purposes when available.
- The CSV listing is derived from the S3 inbox path (`inbox/<orgId>/`) and is only supported by the local/mock S3 client.
- The endpoint enforces org-level RLS and will return 401/404 similarly to the main profile endpoint.
