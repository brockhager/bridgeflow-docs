# BridgeFlow — Beginner Guide

Welcome! This short guide helps a new developer get started quickly with the BridgeFlow codebase. It covers the minimal steps to run the app and tests on your machine and links to deeper docs for advanced topics.

Who are you? Choose your quick path below:

- **Developer (bf_employee)** — hands-on developer tasks and environment setup: see `developer/README.md`.
- **Customer Admin** — manage blueprints, packages, and admin workflows: see `customer-admin/README.md`.
- **End User** — UI-focused demo steps for creating trading partners and activating blueprints: see `user/README.md`.

Pick the link that matches your role and follow the short steps there.

## Prerequisites
- Node.js (recommend LTS) and pnpm. Install pnpm: `npm i -g pnpm`
- A Railway PostgreSQL database account (the project uses Railway-hosted Postgres exclusively).
- (Optional) Docker if you prefer local service emulation for Redis / other services.

## Quick start — minimal steps
1. Clone the repo and change into it:
   ```bash
   git clone <repo-url>
   cd bridgeflow
   ```
2. Install dependencies:
   ```bash
   pnpm install
   ```
3. Provision/verify the Railway test DB and env variables:
   ```bash
   pnpm run railway:setup
   ```
   This sets or verifies the `DATABASE_URL` used by the project (the test DB is typically named `bridgeflow_test`).

4. Start the backend API (port 4000):
   ```bash
   pnpm run api:start
   ```

5. Start the frontend dev server (bundles + dev proxy) in another terminal (port 3000 by default):
   ```bash
   pnpm run web:dev
   ```

6. Visit the app at http://localhost:3000 (the dev server proxies `/api` to `localhost:4000`).

> Tip: On Windows PowerShell set env vars like:
> $env:DATABASE_URL = 'postgresql://user:pass@host:port/bridgeflow_test'

## Running tests
- All tests require a real Railway PostgreSQL database (NO SQLite). The project enforces this to avoid flaky test behavior.
- Run the full test suite:
  ```bash
  pnpm test
  ```
- Run API tests only:
  ```bash
  pnpm run test:api
  ```
- Important: Every test file must call `await resetTestDatabase()` (see `test/utils/resetDb.js`) to ensure isolation and a clean state.

## Seeding dev data
- The repo includes utilities to seed development data:
  - `pnpm run db:seed` or `pnpm run db:seed:blueprints` (see `scripts/`)
  - In dev, the admin dev endpoint `/admin-api/_dev/ensure-dev-seed` can create test users and sample blueprints.

## Common developer tasks
- Generate Prisma client after schema changes:
  ```bash
  pnpm run prisma:generate
  ```
- Run a background worker (examples):
  ```bash
  pnpm run worker:s3-flush:once
  pnpm run worker:metrics-aggregator
  ```

## Project conventions & gotchas
- ESM-only: use `import` / `export` (no CommonJS `require`/`module.exports`).
- Database: Railway-hosted PostgreSQL is the canonical DB for dev/test/CI (do not add SQLite fallbacks).
- Tenant isolation: code uses AsyncLocalStorage + Prisma middleware. See `api/lib/tenantContext.js` for details.
- Do NOT enable `BRIDGEFLOW_DEV_ADMIN` in CI — it masks real auth issues.

## Where to go next (advanced docs)
- Architecture overview: `docs/ARCHITECTURE.md`
- Onboarding & dev orientation: `docs/ONBOARDING.md`
- Glossary (terms & naming): `docs/glossary/README.md`
- Tests and DB reset details: `test/utils/resetDb.js` and `test/setup.js`
- Phase-specific guides (e.g., Bridge Canvas): `docs/phases/` (see `phases31-40` for Phase 32)
- Copilot / agent guidance: `.github/copilot-instructions.md`

## Need help / contacts
- If something is unclear or you hit a blocker, open an issue or contact the repo owner/CTO listed in the project `docs/ONBOARDING.md`.

---
This README is intentionally short; if you'd like I can expand sections (development workflow, debugging tips, CI notes) or add platform-specific steps (Windows/macOS/Linux).