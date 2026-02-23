# Database & Prisma — Local Developer Guide (Windows PowerShell)

This document describes the current state of our databases and how to work with them locally and in CI.

---

## Quick overview ✅
- **Production database**: PostgreSQL (multi‑schema). We use *two* schemas: **public** (app data) and **admin** (admin users / audit logs).
- **Prisma**: schema in `prisma/schema.prisma`. Generator uses the `multiSchema` preview feature and the datasource lists both `admin` and `public` schemas.
- **Testing**: Integration tests that require a real database use a temporary **SQLite** database created by `scripts/setup-sqlite-test-db.js` (minimal schema + `prisma db push`). Unit tests default to a mocked DB (`USE_MOCK_DB=true`).

---

## Production / Local Postgres (recommended dev flow) 🔧

Prerequisites
- Node.js (LTS)
- pnpm
- A running PostgreSQL instance (local, Docker, or cloud)

Environment
- Set `DATABASE_URL` to point at your Postgres instance. Example (PowerShell):

```powershell
$env:DATABASE_URL = 'postgresql://postgres:postgres@localhost:5432/bridgeflow_dev?schema=public'
```

Notes
- The `?schema=...` query sets the *default* search_path; Prisma's datasource still declares both `admin` and `public` schemas and migrations will create the admin schema objects where models are annotated with `@@schema("admin")`.
- The full schema is at `prisma/schema.prisma` — when adding admin tables use `@@schema("admin")` on the model.

Common commands

```powershell
pnpm install
pnpm run prisma:generate    # regenerate @prisma/client after schema changes
pnpm run db:migrate         # runs `prisma migrate deploy` to apply migrations
pnpm run db:seed            # runs seed script to create demo entities/resources
```

Troubleshooting
- If `pnpm run db:migrate` fails: verify `DATABASE_URL`, DB connectivity, and that the DB user has create/migration privileges.
- If a new migration fails, run `pnpm run prisma:generate` locally after editing `prisma/schema.prisma` and test migrations against a disposable DB first.

---

## SQLite test harness (CI & local integration) 🧪

For quick integration tests in CI (and locally) we use a minimal SQLite schema because the full Postgres schema relies on features not supported by SQLite (multi‑schema, some enums, list types, etc.). The helper script `scripts/setup-sqlite-test-db.js`:
- Writes a small SQLite‑compatible Prisma schema (Organization, User, UserOrganization, TradingPartner)
- Runs `prisma db push --schema <tmp_schema> --accept-data-loss` to create the DB file under `.tmp/` (e.g., `.tmp/ethereal-test.db`)
- Runs `prisma generate` for that schema and prints out the DATABASE_URL to set

Run locally (PowerShell example):

```powershell
# Prepare the SQLite DB and client
node scripts/setup-sqlite-test-db.js
$env:DATABASE_URL = "file:.tmp/ethereal-test.db"
# Enable the integration test switch used by the test file
$env:RUN_SQLITE_INTEGRATION = 'true'
# Run the specific integration test(s) that use SQLite
pnpm exec vitest run test/integration/tradingPartners.persistence.test.js
```

Important notes
- The SQLite setup uses `prisma db push` (not `migrate`) and includes `--accept-data-loss` — this is fine for ephemeral test DBs but **do not** use this to overwrite production data.
- When using SQLite, the Prisma `DATABASE_URL` must begin with the `file:` protocol (for example: `file:.tmp/ethereal-test.db`). The helper script prints both PowerShell and POSIX export commands for convenience.
- CI runs a dedicated `sqlite-integration` job that sets `RUN_SQLITE_INTEGRATION=true` and uses `node scripts/setup-sqlite-test-db.js` to prepare the DB before running the tests.

---

## Test flags & expectations 🧩
- By default `pnpm test` uses `USE_MOCK_DB=true` (see `package.json`) to keep unit tests fast and deterministic.
- Integration tests that exercise the real Prisma client must opt in via `RUN_SQLITE_INTEGRATION=true` and (internally) the tests set `USE_MOCK_DB=false`.
- mTLS tests are run separately (`pnpm run test:mtls`) because they require certs & special setup.

---

## Admin schema notes 🔐
- Admin models (e.g., `AdminUser`, `AdminAuditLog`) live in the `admin` schema — they are defined in `prisma/schema.prisma` with `@@schema("admin")`.
- Keep admin models minimal and ensure migrations include both `admin` and `public` schema changes.

---

## Good practices & reminders 💡
- Always run `pnpm run prisma:generate` after changing `prisma/schema.prisma`.
- Use a disposable DB when testing migrations locally (e.g., Docker Postgres or SQLite push scripts) before applying to shared/staging databases.
- Do not commit real credentials — use `.env` and `.env.example` to document variables.

---

## Useful file references 🔗
- Prisma schema: `prisma/schema.prisma`
- SQLite integration helper: `scripts/setup-sqlite-test-db.js`
- SQLite integration test example: `test/integration/tradingPartners.persistence.test.js`
- Migrations & deploy workflow: `.github/workflows/migrate.yml`

If you'd like, I can also add a short troubleshooting checklist or an example Docker Compose snippet for a local Postgres instance — want me to add that? 🚀
