# Breakfix: Auto-seed CTO user in dev/mock DB (cto@bridgeflow.test)

## Summary ✅
The running development server in mock/test mode did not include an always-available `cto@bridgeflow.test` user out-of-the-box. This caused manual login attempts (and the admin UI dev flows) to receive 401 Unauthorized because the mock DB is process-local and typically empty unless explicitly seeded by tests.

## Root cause 🔍
- The mock DB is reset per-run and tests seed users on-demand within their test processes.
- A separately started server process (e.g., `node api/server.js`) therefore had no named dev users like `cto@bridgeflow.test`.

## Fix implemented ✅
- Auto-seed behavior for dev/mock DB: when the running server is using the mock DB, it now runs the dev seeder to create named dev users and sample data (including `cto@bridgeflow.test` with role `bf_employee`).
- Added a dev-only HTTP endpoint to seed the running server on demand:
  - POST `/admin-api/_dev/ensure-dev-seed` — triggers `ensureDevSeed(prisma)` in the server process.
- Added a convenience script for running a mock DB seed from the repo:
  - `scripts/run-seed-mock.mjs` (calls `scripts/run-seed-dev.js` with `USE_MOCK_DB=true`)

Files changed / relevant additions:
- Modified: `api/server.js` — prefer seeding when running with mock DB, logs guidance for real DBs
- Added: `api/routes/dev.js` — endpoint `/admin-api/_dev/ensure-dev-seed`
- Added: `scripts/run-seed-mock.mjs` — run seeded mock easily
- Existing: `api/lib/seedDevData.js` — seeder used (idempotent)

## How to verify ✔️
1. Start the server in mock mode and seed automatically:
   - Windows (cmd): `cmd /c "set USE_MOCK_DB=true && node api/server.js"`
   - PowerShell: `$env:USE_MOCK_DB='true'; node api/server.js`
   - Then run:
     ```bash
     curl -i -X POST http://127.0.0.1:4000/api/auth/login \
       -H "Content-Type: application/json" \
       -d '{"email":"cto@bridgeflow.test","password":"BridgeFlow123!"}'
     ```
   - Expect: 200 OK with token, and `user.role` === `bf_employee`.

2. If server is running already, trigger on-demand seeding (no restart required):
   ```bash
   curl -i -X POST http://127.0.0.1:4000/admin-api/_dev/ensure-dev-seed -H "Content-Type: application/json"
   ```

3. Alternatively, run the local mock seeder script:
   ```bash
   node scripts/run-seed-mock.mjs
   ```

## Security & Safety ⚠️
- **Dev-only:** All seeding is guarded and intended for development/test workflows only. No automatic seeding runs in production.
- The ensure-seed endpoint is a dev route and only available when dev routes are enabled (by design).

## Notes & troubleshooting 💡
- If your server is using a *real* DB (e.g., SQLite or Postgres) and the schema/migrations have not been applied, the seeder will *not* auto-run on startup to avoid accidental DB changes; instead use `node scripts/run-seed.js` after applying migrations.
- If curl cannot connect, confirm the server is listening on port 4000 and the server process is the same one you seeded (mock DB is per-process).

---

If you want, I can open a short PR containing this breakfix doc and a small README update linking to it.
