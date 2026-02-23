# Integrations (QBO, CSV mailbox, Partner Gateway)

QuickBooks (QBO)
- Credentials: stored per-organization in `IntegrationCredential.encryptedData` (AES-256-GCM via `api/lib/crypto.js`). Decrypted to obtain `realmId` and token information when performing syncs.
- Sync behavior: `api/lib/qboClient.js` fetches PurchaseOrder objects using QBO's API, handles token refresh and persists updated encrypted tokens.
- UI: `GET /api/tp/:id/profile/aggregate` shows `qbo.connected` and `realmId` when available.

CSV Mailbox
- Files are stored in S3 inbox paths (`inbox/<orgId>/...`) via `api/handlers/partnerInbound.js` for partner uploads or the CSV upload handler.
- Phase 21B aggregation can read mock S3 storage locally for simple counts and summary strings.
- Admin UI shows a static summary string when available (e.g., `CSV Upload (purchase_order.csv, invoice.csv)`).

Partner Gateway (Inbound)
- Partners use `X-Partner-Key` header and the `POST /partner/:partnerId/invoice` endpoint to submit invoices.
- Server validates invoice shape, enqueues payload to `partner_inbound:<orgId>` stream (Redis) and writes a CSV to S3 inbox for visibility.
- Idempotency: the handler accepts idempotency keys and uses Redis streams / LPUSH fallback for enqueuing.

Common patterns
- Security: partners supply a key that is hashed (sha256) and stored in `PartnerApiKey.key` — the raw key is shown at creation only.
- Observability: metrics include counters for `partner_invoice_received_total` and `partner_invoice_failures_total`, and QBO sync metrics (`qbo_sync_refresh`).
- Processing: workers or stream consumers read from tenant-specific streams and transform or forward messages to delivery jobs.

References:
- See `api/handlers/partnerInbound.js` and `api/lib/qboClient.js` for implementation details and error handling.