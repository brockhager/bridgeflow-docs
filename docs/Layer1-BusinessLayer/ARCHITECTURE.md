# Layer 1 Architecture (Overview)

## Components

- api/server.js — Fastify server and route registration
- api/handlers/* — Resource-specific handlers (mappings, templates, users, orgs)
- api/lib/* — Shared services: RBAC, rate-limiting, MTLS integration, storage adapters
- api/worker/* — Background worker loops and job processing logic
- prisma/ — DB schema (multi-schema pattern: `public` + `admin`), migrations
- tests/ & api/tests/ — Unit and integration tests (Vitest), worker integration tests

## Data flow (high-level)

Client -> api/server (preHandlers: auth, rate-limit, mTLS) -> Handler -> Service -> Prisma -> DB

When jobs are enqueued:
Handler -> enqueue job -> Worker (separate process) -> execute task -> write audit/events -> update DB

## Integration points

- Database: Postgres via Prisma (multi-schema). Tests may use `USE_MOCK_DB=true` (mock DB) for fast CI runs.
- Redis: used for rate-limiting and TTL stores; in-memory fallback used in tests when Redis not available.
- mTLS / TLS validation: plugin lives in `api/lib/mtls.js` and is exercised by Node-only tests (moved to node runner).
- External services: Stripe webhook handler, secrets backends (AWS, Vault), emailer (nodemailer/Ethereal for dev).

## Technology choices

- Node.js (ESM-only), Fastify (HTTP), Prisma (ORM), Vitest (test runner), pnpm (package manager)

## Operational notes

- Feature flags and environment variables drive behavior: `REQUIRE_AUTH`, `ENFORCE_RBAC`, `LOCKDOWN_JOBS`, `USE_MOCK_DB`.
- mTLS-heavy tests are isolated and run under `node --test` with a memory limit to avoid OOM (see `scripts/run-mtls-safely.js`).

---

## TODOs
- Add component diagrams (SVG/plantuml) for the architecture doc.
- Expand the worker lifecycle section with error handling and retries.
