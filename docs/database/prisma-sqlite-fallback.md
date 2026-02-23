Prisma: SQLite fallback for local development

Rationale

Prisma's `datasource.provider` does not accept an `env()` value, so a single schema cannot dynamically switch providers at runtime. To preserve a production-grade PostgreSQL schema while still enabling lightweight local development and CTO demos, we use a two-schema strategy:

- The canonical schema is `prisma/schema.prisma` and targets PostgreSQL for CI and production. This schema may use Postgres-specific features (schemas, enums, etc.).
- For local/dev/demo usage we generate a minimal, SQLite-compatible schema at `.tmp/schema.sqlite.prisma` (via `scripts/setup-sqlite-test-db.js`) and run `prisma db push` / `prisma generate` against that schema.

How it works

- `scripts/setup-sqlite-test-db.js` creates `.tmp/ethereal-test.db`, writes a SQLite-compatible schema to `.tmp/schema.sqlite.prisma`, runs `prisma db push` and `prisma generate`, and sets `process.env.DATABASE_PROVIDER='sqlite'` and `process.env.DATABASE_URL` for child processes.
- Start scripts (`start/start-ctodemo.ps1`, `start/ensure-api.ps1`) set `DATABASE_PROVIDER=sqlite` and `DATABASE_URL=file:...` when launching demo windows so the API runs against SQLite for demos.

Commands (quick)

- Generate Postgres client (CI / production):
  pnpm install
  pnpm exec prisma generate --schema prisma/schema.prisma

- Local SQLite setup (dev / CTO demo):
  node scripts/setup-sqlite-test-db.js
  # then start the API (PowerShell sample):
  $env:NODE_ENV='development'
  $env:DATABASE_PROVIDER='sqlite'
  $env:DATABASE_URL='file:.tmp/ethereal-test.db'
  pnpm run api:start

Notes

- The repository CI includes a workflow that validates both the main Postgres schema and the generated SQLite schema to prevent schema drift.
- This approach keeps production schema authoritative while providing a reliable, fast local dev experience for demos and tests.
