# Troubleshooting & Debugging (Trading Partners)

Common issues
- 401 / Missing organization context
  - Cause: requests not authorized or missing customer API key; ensure `validateCustomerApiKey` middleware supplied `customerOrgId`.
- 404 / TP not found
  - Cause: TP belongs to a different organization or ID is invalid.
- Partner inbound 500 / enqueue failures
  - Cause: Redis unavailable or S3 upload error; check worker logs and metrics counters (`partner_invoice_failures_total`).

Debugging tips
- Verify middleware context: add temporary logs in `preHandler` if necessary to confirm `customerOrgId`/`partnerOrgId` values.
- Check Redis streams: use redis CLI to view `XRANGE partner_inbound:<orgId> - +` or `keys raw_payloads:*` for pending messages.
- Check S3 mock: in local dev, `api/lib/s3.js` stores files in-memory; search for keys like `inbox/<orgId>/`.

Logging & metrics
- Partner invoice counts: `partner_invoice_received_total` and `partner_invoice_failures_total`.
- QBO: `qbo_sync_refresh` tracks token refresh events.

Developer notes
- If you see a runtime `SyntaxError` from `await import(...)`, ensure dynamic imports are not used at top-level in non-async contexts (see previous server fix).