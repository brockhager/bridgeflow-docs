> [!WARNING]
> Status: Planned / In Development
> Context: Original BF-INTEGRATION Vision (Pre-Phase 30)
# Phase 20 — Partner Inbound Gateway & Inbox Delivery (20A / 20B / 20C) ✅

**Status:** Completed and pushed to `main` (backend + admin UI + tests + docs). 🎉

---

## Executive summary 🔍
Phase 20 delivered the Partner Inbound Gateway (20A) and Inbox Delivery (20B), and the Admin Partner Management UI (20C). This completes end-to-end partner onboarding and invoice ingestion: partners can be issued API keys via the admin UI, post invoice JSON to the Partner Gateway, and those invoices are enqueued and recorded in the S3 inbox for downstream processing.

Key outcomes:
- Secure partner API key model with RLS awareness (sha256-stored keys)
- Partner authentication middleware and idempotent ingestion pipeline
- Redis stream enqueue + S3 inbox delivery for visibility
- Minimal Admin UI to create/list/revoke partner keys
- Tests (unit & integration) and documentation updates

---

## What was implemented (high-level) ✅
- 20A — Partner Inbound Gateway
  - POST /partner/:partnerId/invoice (auth via X-Partner-Key)
  - Validates invoice JSON, enqueues to Redis stream `partner_inbound:<orgId>`, writes CSV to S3 inbox `inbox/<orgId>/<uuid>.csv`
  - Idempotency support (via existing idempotency middleware, header `Idempotency-Key` / `X-Idempotency-Key`)
  - Metrics: `partner_invoice_received_total`, `partner_invoice_failures_total`

- 20B — Inbox delivery & visibility
  - Partner invoice JSON → converted to CSV using the existing invoice template and uploaded to the S3 inbox
  - Existing inbox listing endpoint (`GET /api/customer/:id/inbox`) shows inbox contents (partner entries included)

- 20C — Admin Partner Management UI (MVP)
  - Admin page: `/partners` in the admin app
  - Create Partner (returns raw API key once) — POST `/api/admin/partner`
  - List partners (by organization) — GET `/api/admin/partner?organizationId=...`
  - Revoke partner key — DELETE `/api/admin/partner/:partnerId/key`
  - UI shows raw API key once in a dismissible banner and never persists/logs it

---

## Files added / changed (representative) 🗂️
- Prisma / DB
  - `prisma/schema.prisma` — added `PartnerApiKey` model (sha256 key, partnerId, organizationId)

- Backend
  - `api/lib/middleware/partnerAuth.js` — validates `X-Partner-Key`, sets `request.partnerOrgId` & `request.partnerId`
  - `api/handlers/partnerInbound.js` — `receiveInvoice` handler (validation, enqueue, CSV->S3)
  - `api/handlers/admin/partnerAdmin.js` — admin handlers for create / list / revoke
  - `api/routes/admin/partnerRoutes.js` — admin route registration
  - `api/lib/metrics.js` — added `partnerInvoiceReceived` and `partnerInvoiceFailure` helper counters

- Tests
  - `test/middleware/partner-auth.test.js` (unit)
  - `test/integration/partner-inbound.integration.test.js` (integration: enqueue + inbox + idempotency)
  - `test/handlers/partnerAdmin.test.js` (admin create/list/revoke) 
  - `admin-bridgeflow/test/partnerManagement.test.jsx` (admin page unit tests)

- Admin UI
  - `admin-bridgeflow/src/pages/Admin/PartnerManagementPage.jsx` (MVP page)
  - route added in `admin-bridgeflow/src/App.jsx`

- Docs
  - `docs/integrations/partner-inbound.md` (contract, examples)
  - `docs/phases/phase-20-completion.md` (this file)

---

## Contracts & usage examples 🧾
Create partner (admin):

- POST /api/admin/partner
  - Body: `{ name: string, organizationId: string, deliveryMethod: 'dashboard'|'email' }`
  - Response: `{ partnerId: "...", apiKey: "partner_..." }`  ← **raw apiKey returned only at creation**

List partners:
- GET /api/admin/partner?organizationId=org-123 → `{ partners: [{ id, name, deliveryMethod, createdAt, organizationId }, ...] }`

Revoke keys:
- DELETE /api/admin/partner/:partnerId/key → `{ success: true, revoked: N }`

Partner posts invoice:
- POST /partner/:partnerId/invoice
  - Headers: `X-Partner-Key: <raw-key>`
  - Body (JSON): minimal schema {
    invoiceId: string,
    customerId: string,
    amount: number,
    currency: string,
    invoiceDate: string (ISO)
  }
  - Success: 202 Accepted (enqueued)
  - Duplicate idempotency key: stored response returned + `x-from-idempotency: true` header

cURL examples:

- Create partner (admin):
```
curl -X POST https://api.local.test/api/admin/partner \
  -H "Content-Type: application/json" \
  --data '{"name":"Acme","organizationId":"org-123","deliveryMethod":"dashboard"}'
```

- Partner invoice post:
```
curl -X POST https://api.local.test/partner/p-1/invoice \
  -H "Content-Type: application/json" \
  -H "X-Partner-Key: partner_test_abc" \
  --data '{"invoiceId":"I1","customerId":"C1","amount":120.5,"currency":"USD","invoiceDate":"2025-06-01"}'
```

---

## Testing & validation ✅
- Unit & integration tests added and run locally (Vitest): middleware, handlers, and admin page tests.
- Manual runs validated: idempotency behavior, redis enqueue (via in-memory redis stub), S3 inbox writes (via s3 mock), and admin UI flows (JSDOM tests).

---

## Security & operational notes 🔒
- API keys are stored only as SHA-256 hashes in `PartnerApiKey` — raw keys are shown only once on creation and not logged or persisted.
- RLS-compatible: `PartnerApiKey.organizationId` is denormalized to support tenant-scoped queries without costly joins.
- Idempotency TTL respects `IDEMPOTENCY_TTL_HOURS` env var (default: 24h).
- Rate limiting and RBAC applied: partner gateway is secured via `X-Partner-Key`; admin endpoints require admin permissions (`requirePermission('admin:partners:manage')`).

---

## Next steps (optional backlog) ▶️
- Email delivery pipeline: implement `sendInvoiceNotification(orgId, s3Key)` and templating (deferred intentionally).
- End-to-end Playwright tests that run the full flow using a test server (create partner via UI, post invoice, assert S3 inbox entry).
- Grafana dashboards or Prometheus panels for `partner_invoice_*` metrics.

---

If you want, I can follow up by adding the e2e Playwright test or implementing the email delivery flow next — say which and I’ll pick it up. ✨

