> [!WARNING]
> Status: Planned / In Development
> Context: Original BF-INTEGRATION Vision (Pre-Phase 30)
# Phase 19 Progress

## 19B: CSV Mailbox — Core Engine (✅)
- Backend CSV upload endpoint: `POST /api/upload/csv` implemented
- Stores original CSV into S3 inbox (`inbox/<orgId>/<template>/`)
- Enqueues parsed payloads to Redis Streams (`raw_payloads:<orgId>`) with LPUSH fallback
- Idempotency and rate-limiting applied via middleware
- E2E integration test added and passing: `test/integration/upload-csv-integration.test.js` ✅

## 19C: QuickBooks Connector — Backend (✅)
- QBO OAuth credential storage: `IntegrationCredential` model (encrypted AES-256-GCM)
- QBO client with refresh logic and per-org rate limiting implemented
- Mapping of QBO PurchaseOrder → internal payloads (`api/lib/qboToInternal.js`)
- Sync ingestion endpoint: `POST /api/qbo/sync` (auth via `x-api-key`, rate-limited)
- Idempotent producer (checks `IdempotencyKey` and skips duplicates) with integration test `test/integration/qbo-sync.integration.test.js` ✅

## 19A: Partner Connection Wizard — Frontend (🔜)
- Frontend route pattern and guardrails finalized by Solution Architect
- Frontend Lead: Start building `ConnectionFlow` routed sub-app using nested routes
- Frontend Integration Guide added: `docs/integrations/frontend-integration.md` (dev debug endpoint `GET /api/debug/customer-context` included)
- Backend endpoints for 19A/19C remain unchanged; you can start integrating now

---
Notes: small follow-ups added:
- Accept `text/csv` and `text/plain` contenttypes for CSV uploads to improve compatibility
- Added extra tests for content-type and header-only API key validation to increase coverage

## 20A/B kickoff (partner inbound & inbox delivery)
- `PartnerApiKey` Prisma model added (Phase 20A)
- `POST /partner/:partnerId/invoice` gateway implemented with `validatePartnerApiKey` middleware, idempotency and Redis enqueue
- Partner payloads are converted to CSV and stored in S3 inbox path (`inbox/<orgId>`) for visibility (Phase 20B)
- Metrics: `partner_invoice_received_total`, `partner_invoice_failures_total`
- Docs: `docs/integrations/partner-inbound.md` (contract, examples, idempotency)

