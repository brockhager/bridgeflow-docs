> [!WARNING]
> Status: Planned / In Development
> Context: Original BF-INTEGRATION Vision (Pre-Phase 30)
# Row-level Security (RLS) & Idempotency — Phase 18 Design Notes

## Goals
- Enforce tenant isolation at the DB layer using Postgres RLS where appropriate.
- Add application-level idempotency support to safely dedupe client retries for ingest endpoints.
- Use Redis Streams for high-throughput ingest buffer and add an S3 flush worker for persistence.

## Idempotency
- Schema:
  - `idempotency_keys (key_hash, tenant_id, response JSONB, created_at)`
  - Keys are stored as sha256(tenantId + ':' + providedKey).
  - TTL: configurable via `IDEMPOTENCY_TTL_HOURS` (default: 24h)
- Behavior:
  - Incoming requests with `Idempotency-Key` header are checked; if a recent result exists, return it immediately.
  - On first request, persist the response once handler finishes (best-effort), so subsequent retries get the same response.

## Postgres RLS
- Migrations include an RLS template: create the table, enable RLS and attach a policy that compares `organization_id` to `current_setting('app.current_org_id')`.
- App must set per-transaction setting `SET LOCAL app.current_org_id = '<organization-id>'` (or use `withOrgContext(orgId, fn)`/`runWithTenant`) before requests reach DB.
- Prisma middleware injects tenant into create requests and enforces `where` filters for reads/updates/deletes when model is tenant-scoped.
- **Note:** The `IntegrationCredential` model is tenant-scoped and should be covered by RLS policies so credentials are isolated per organization.
- Scripts and checks (e.g., `scripts/verify-rls.js`, `scripts/check-tradingpartners-rls.js`) rely on `app.current_org_id` being set; use the helper `runWithTenant`/`withOrgContext` in background jobs to ensure RLS is applied.

## Redis Streams + S3 worker
- Ingest pipeline writes to Redis streams (`ingest:stream:<tenantId>`) using XADD when available; fallbacks to lists for stubbed Redis.
- A consumer worker group claims messages (XREADGROUP) and writes payload batches to S3 in the configured bucket/prefix.

## Operational Notes
- Add pruning job to remove old idempotency keys (7+ days).
- Add infra module for managed Redis (Elasticache / Memorystore) with TLS and auth.

## Next steps / Implementation
- Implement idempotency middleware (done: `api/lib/middleware/idempotency.js`).
- Register Prisma tenant middleware to inject tenant and reject missing tenant where filters (done: `api/lib/db.js`).
- Add migrations SQL (see `scripts/migrations/2025-12-29_add_idempotency_and_rls.sql`).
- Implement and wire S3 flush worker (scaffold in `workers/s3FlushWorker.js`).
- Add instrumentation (metrics) and tests.

