> [!WARNING]
> Status: Planned / In Development
> Context: Original BF-INTEGRATION Vision (Pre-Phase 30)
# Phase 18 — Customer API Platform (Completion)

## ✅ Status
**Phase 18: COMPLETE** — core deliverables implemented and validated (see summary below). 🎉

- **18A (Idempotency):** Implemented DB-backed idempotency keys, middleware, pruning job, and metrics.
- **18B (RLS):** PostgreSQL Row-Level Security **enabled** on tenant-scoped tables (TradingPartner, Integration, ApiKey/CustomerApiKey) with tenant isolation policy `organizationId = current_setting('app.current_org_id')::uuid`.
- **18C (Ingest pipeline):** Tenant-scoped ingest route with Redis Streams producer, S3 flush worker, and tenant-aware Redis rate limiting.

---

## 🧭 Architecture (ingest flow)

1. Client POST /ingest/:customer_id/:endpoint_slug (authenticated with `x-api-key`)
2. `validateCustomerApiKey` authenticates and sets `request.customerOrgId` (organization context)
3. `rateLimiterMiddleware` enforces per-tenant rate limits (Redis counter)
4. `idempotencyMiddleware` checks/persist idempotent responses in DB
5. Ingest handler enqueues message to Redis Stream `raw_payloads:<tenantId>` (XADD), falls back to `ingest_fallback:<tenantId>` (list)
6. Background worker `workers/s3-flush-worker.js` reads streams (XREAD), writes batched payloads to S3 (random prefix per object), and ACKs on success

Diagram (linear):

Client → validateCustomerApiKey → rateLimiterMiddleware → idempotencyMiddleware → handler → Redis Stream → S3 Flush Worker → S3

---

## 🔐 Security guarantees

- **Authentication:** Customer API keys validated with secure bcrypt hashed keys (`validateCustomerApiKey`).
- **Authorization:** RBAC middleware and request context (`request.customerOrgId`) enforce resource scoping.
- **RLS:** Postgres RLS policies are in place for tenant-scoped tables and rely on `SET LOCAL app.current_org_id` injected per-transaction (via tenant middleware) — this enforces DB-level tenant isolation even if app logic were to be bypassed.
- **Rate limiting:** Tenant-aware, Redis-backed counters; fail-open behavior on Redis error to preserve availability with metrics indicating degraded state.
- **Idempotency:** Responses persisted to idempotency keys (sha256(tenant + ':' + key)) to guarantee safe retries and deduplication.

---

## 🔧 Operational runbook (short)

- Metrics to monitor:
  - `ingest_requests_total{status}` (allowed, rate_limited)
  - `ingest_redis_errors_total`
  - `idempotency.keys_pruned`
  - `s3.flush.success`, `s3.flush.error`
  - `ingest_redis_latency_seconds`

- Key components:
  - Redis (Streams + counters) — ensure `REDIS_URL` and auth if present, watch memory and streams backlog
  - S3 worker — ensure S3 bucket configured and worker `runWorker()` is scheduled
  - DB (Postgres) — RLS policies present on table set; verify `current_setting('app.current_org_id')` is set per transaction

- Runbook steps (common ops):
  - If ingestion backlog grows: check Redis Streams size, verify S3 worker is running and healthy; scale worker or increase parallelism in Phase 19.
  - If rate limit spikes: check `ingest_requests_total` by org, review allow/deny lists and redis availability.
  - If idempotency key store grows: run `node scripts/prune-idempotency-keys.js` (configured TTL env var)

---

## ✅ How we validated (high level)

- Unit tests for idempotency middleware, prune job, metrics exporter, and stores.
- Integration tests for trading partner duplicate-name behavior (409 structured response).
- Redis Streams producer & S3 worker tests: unit + integration verifying batch behavior, fallback, and prefixing.
- Tenant-aware rate limiter tests (limits, fail-open behavior).
- Postgres RLS: policies applied in dev; verified with targeted RLS verification script that checks cross-org visibility.

---

## 📣 Announcement draft for #engineering

> 🎉 Phase 18 Complete — Customer API Platform is ready!
>
> Highlights:
> - Authenticated & RBAC-protected ingest API
> - Tenant-aware rate limiting (Redis) ✅
> - Idempotency (DB) ✅
> - Redis Streams → S3 ingestion pipeline ✅
> - PostgreSQL Row-Level Security (RLS) enforced on tenant-scoped tables ✅
>
> Thanks to the team (Agent4, Solution Architect, CTO) for the rapid delivery and verification. Next: monitor rollout and schedule Phase 19 for robustness improvements (DLQs, backoff, and scaling).

---

## Links & artifacts
- Key files:
  - `api/lib/middleware/idempotency.js`
  - `api/middleware/rate-limiter.js`
  - `workers/s3-flush-worker.js`
  - `scripts/prune-idempotency-keys.js`
  - `scripts/verify-rls.js` (quick RLS verification script)
  - `scripts/check-tradingpartners-rls.js` (detailed RLS inspection)

---

If you want, I can now:
- Push a short PR with the above doc if you prefer PR workflow, or commit directly to `main` (I committed to `main` for Phase 18 per prior instructions). ✅
- Post the announcement text to #engineering (I can prepare it as a message here for manual posting).

---

**Phase 18 ✔️ — Ready for handoff / production review**

