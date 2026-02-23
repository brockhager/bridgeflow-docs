# Partner Inbound Gateway (Phase 20A/B)

This document describes the Partner Inbound Gateway contract for partners to post invoices to BridgeFlow.

## Endpoint
- POST /partner/:partnerId/invoice
- Auth: `X-Partner-Key: <raw-key>` (returned once at creation; server stores sha256 hash only)
- Dev note: Partner API keys are stored in `PartnerApiKey` model and mapped to `organizationId` for RLS.

## Auth & RLS
- Use `X-Partner-Key` header (or `Authorization: Bearer <key>`)
- The middleware `validatePartnerApiKey` validates the header and attaches `request.partnerOrgId` and `request.partnerId`.
- If missing or invalid: 401 Unauthorized
- If partnerId in URL does not match key: 403 Forbidden

## Payload (invoice JSON)
Required fields (minimal):
- `invoiceId` (string)
- `customerId` (string)
- `amount` (number)
- `currency` (string)
- `invoiceDate` (ISO date string)

Example:
```
{
  "invoiceId": "I-123",
  "customerId": "C-42",
  "amount": 120.50,
  "currency": "USD",
  "invoiceDate": "2025-06-01"
}
```

## Idempotency
- Supports `Idempotency-Key`/`X-Idempotency-Key` header.
- Uses existing idempotency middleware (TTL controlled by `IDEMPOTENCY_TTL_HOURS`).
- Duplicate requests with same idempotency key return stored response and include header `x-from-idempotency: true`.

## Enqueue & Delivery
- Partner invoices are enqueued to Redis stream `partner_inbound:<organizationId>` with fields:
  - `idempotencyKey`, `payload` (JSON string), `source: 'partner'`
- A copy is also converted to CSV and uploaded to S3 inbox path `inbox/<orgId>/<uuid>.csv` for visibility.
- If `TradingPartner.deliveryMethod === 'email'`, an email notification can be triggered (via `sendInvoiceNotification`).

## Observability
- Metrics added: `partner_invoice_received_total`, `partner_invoice_failures_total`

## Notes for Frontend / Admin
- Admin UI (20C) will create and return raw partner API keys; keys are stored as sha256 hashes and are shown **only once** on creation.
- Ensure the partner is associated with a single organization (enforced in UI and validated by gateway).

---

If you'd like, I can add a small Postman/cURL example and an end-to-end Playwright test that simulates partner upload and inbox check.