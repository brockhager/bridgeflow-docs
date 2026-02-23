> [!WARNING]
> Status: Planned / In Development
> Context: Original BF-INTEGRATION Vision (Pre-Phase 30)
# Phase 16 Local Dev — SQLite setup

This short guide explains how to run Phase 16 integration work locally using SQLite (no external Postgres required).

## Setup

1. Install dependencies

```bash
pnpm install
```

2. Create a temporary SQLite DB and generate Prisma client

```bash
node scripts/setup-sqlite-test-db.js
# This will create `.tmp/ethereal-test.db` and generate a Prisma client for it
# It will also print the DATABASE_URL to use.
```

3. Export environment variables (PowerShell example)

```powershell
$env:DATABASE_URL = "file:.tmp/ethereal-test.db"
$env:USE_MOCK_DB = "false"
$env:NODE_ENV = "test"
# Enable the SQLite integration test (opt-in):
$env:RUN_SQLITE_INTEGRATION = "true"
```

4. Run the integration test(s)

```bash
pnpm exec vitest run test/integration/tradingPartners.persistence.test.js
```

## Running the server locally (manual testing)

You can run the server in a separate shell with the same env vars, then use the UI to create a TP and verify persistence:

```bash
node scripts/setup-sqlite-test-db.js
export DATABASE_URL=file:.tmp/ethereal-test.db
export USE_MOCK_DB=false
pnpm run api:start
```

Then open the web UI and create a Trading Partner; it should be written to the SQLite DB.

## Notes
- For CI, a GitHub Actions job runs the same `scripts/setup-sqlite-test-db.js` and executes the vitest integration test.
- The setup script now generates a **minimal SQLite-compatible Prisma schema** (only Organization, User, UserOrganization, TradingPartner) to avoid Postgres-only features like schemas and Json fields.
- Production still uses Postgres; migrations are handled via Prisma (`prisma migrate deploy`).

