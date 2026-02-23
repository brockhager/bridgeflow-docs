Local Dev with SQLite

Why use SQLite locally?

For fast, repeatable local development and demos (including CTO demos), using a lightweight SQLite DB avoids the overhead of running a full Postgres service while allowing tests and dev flows to exercise persistence. We use a generated, SQLite-compatible schema so local runs do not need to exactly match production's Postgres features.

Quick usage

- Create and prepare the SQLite test DB and client:
  node scripts/setup-sqlite-test-db.js

- Start the API in development mode (PowerShell):
  $env:NODE_ENV='development'
  $env:DATABASE_PROVIDER='sqlite'
  $env:DATABASE_URL='file:.tmp/ethereal-test.db'
  pnpm run api:start

- Or run the CTO demo launcher (automatically sets SQLite envs):
  start\start-ctodemo.ps1

Notes

- `setup-sqlite-test-db.js` sets `DATABASE_PROVIDER=sqlite` and `DATABASE_URL` for child processes and generates a compatible Prisma client under `.tmp/`.
- For CI and production, continue to use the canonical Postgres schema (`prisma/schema.prisma`) and `DATABASE_PROVIDER=postgresql`.
