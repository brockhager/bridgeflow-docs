# Breakfix: start-admin ping + dev seeder + dev login fixes (2026-01-08)

**Summary**

This breakfix addresses three related dev-experience issues observed while starting the local admin/dev stack:

- `start/start-admin.ps1` polled `/admin-api/_dev/ping` using GET which resulted in repeated 404s and a ping timeout. ✅
- The dev seeder endpoint (`/admin-api/_dev/ensure-dev-seed`) could be invoked against a non-mock DB, risking accidental seeding of a real database. ⚠️
- The Admin UI dev login used a different dev token string than the API expected and the dev stub lacked `admin:tenets:*` permissions. This caused 401s when attempting Tenet CRUD from the admin UI. 🔐

---

## Symptoms

- `start-admin.ps1` printed "API did not respond to ping after 30 seconds; continuing without seeding" and logs showed many 404s for `/admin-api/_dev/ping`.
- On the admin UI, creating a Tenet produced `401 Unauthorized` responses when sending POST `/admin-api/tenets`.
- Manual calls to `/admin-api/_dev/ensure-dev-seed` could fail or succeed incorrectly depending on DB mode (real vs mock).

---

## Root causes

1. The dev ping route is implemented as POST (and expects a JSON body), but the startup script polled it using GET.
2. `/admin-api/_dev/ensure-dev-seed` allowed seeding regardless of whether the server was running with the in-process mock DB (unsafe for real DBs).
3. Admin UI dev-login used `dev-access` / `dev-refresh` while the server recognized `dev-access-token` / `dev-refresh-token`. The dev fallback also lacked `admin:tenets:create|read|update|delete` permissions.

---

## Fixes implemented

- start/start-admin.ps1
  - Polls `/admin-api/_dev/ping` using **POST** with an empty JSON body (`{}`), increased timeout and added mid-wait logging.
  - After a successful ping it calls `/admin-api/_dev/ensure-dev-seed` to idempotently seed the running process (mock DB only).

- api/routes/dev.js
  - `POST /admin-api/_dev/ensure-dev-seed` now checks `isMock()` from `api/lib/db.js` and returns `400 NotMockDb` when not running in mock mode to avoid accidental seeding of a real DB.

- api/handlers/auth.js
  - The dev auth fallback (`dev-admin`) now includes `admin:tenets:read`, `admin:tenets:create`, `admin:tenets:update`, `admin:tenets:delete` permissions so dev logins can manage tenets.

- admin-bridgeflow/src/auth/AuthContext.jsx
  - Dev-login now stores `dev-access-token` and `dev-refresh-token` (matching what the server accepts) when using the local dev convenience login.

- Tests and verification
  - Ran `pnpm run test:api` — all tests pass. Added manual smoke verifications (ping, seeder, CTO login, Tenet create).

---

## How to verify locally

1. Start the unified dev stack (recommended):

   powershell -NoProfile -ExecutionPolicy Bypass -File .\start\start-admin.ps1

   - Check the start logs: you should see `API ping OK` and the seeder response (created dev users/orgs).

2. Manually test ping + seeder (if API is already running):

   curl -X POST http://127.0.0.1:4000/admin-api/_dev/ping -H "Content-Type: application/json" -d '{}'
   curl -X POST http://127.0.0.1:4000/admin-api/_dev/ensure-dev-seed -H "Content-Type: application/json" -d '{}'

3. Dev-login in Admin UI (localhost):

   - Use: email `admin@localhost.dev`, password `testpass` (TOTP `123456` if prompted). Confirm `admin_token` in localStorage equals `dev-access-token`.
   - Create a new Tenet via the TenetProfiles UI. The POST to `/admin-api/tenets` should succeed (HTTP 200/201).

4. Run tests to ensure nothing regressed:

   pnpm run test:api

---

## Notes & follow-ups

- The startup script still depends on the API becoming responsive within the configured timeout (30s by default). If your machine is slow to boot the API window, consider increasing the timeout or starting the API in the foreground and running the seeder manually.
- Optionally add a small dev-only smoke test that exercises `POST /admin-api/tenets` with the `dev-access-token` to prevent regressions.

---

If you'd like, I can add the small dev-smoke-test and open a PR for review. Let me know if you want any wording changes or more examples in this breakfix note.