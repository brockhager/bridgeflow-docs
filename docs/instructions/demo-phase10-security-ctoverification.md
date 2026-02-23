# Demo: Phase 10 Security Verification (CTO)

**Goal:** Provide a short, 30-minute demo script for the CTO to verify Phase 10 security (RBAC, audit, job lockdown, friendly 401/403 UX). ✅

---

## Overview ✨
- Timebox: **30 minutes** (setup + verification)
- Top-level checks:
  - Start secure dev server with job lockdown & RBAC enabled
  - Create dev users (user + operator)
  - Verify unauthenticated requests fail (401)
  - Verify user can create jobs but cannot perform operator-only actions (403)
  - Verify operator can perform privileged actions
  - Confirm audit logs contain relevant events
  - Validate friendly 401/403 messages in the UI

---

## Quick Prereqs 🔧
- Node.js (v18+ recommended)
- pnpm installed
- From repo root: c:\JS\bridgeflow
- Ensure migrations are applied if you use a real DB; tests use mock DB by default.

---

## Commands — get started ▶️
1) Start secure dev server (PowerShell):

```powershell
pnpm run dev:secure
# This runs the API with LOCKDOWN_JOBS=true REQUIRE_AUTH=true ENFORCE_RBAC=true
# Server listens on http://localhost:4000
```

2) Create dev users (runs registration flows and prints credentials):

```powershell
# Recommended: include super admin email in env so admin is recognized
$env:SUPER_ADMINS='dev-op@example.com'
node scripts/create-dev-users.mjs
# Look for printed lines like: dev user: <email> / password: <secret>
# and super admin user: <email> / password: <secret>
```

Note: If the script cannot reach the running API (network/server not ready), it will fall back to creating the user records directly in the database. If you prefer to always create users directly, run `node scripts/create-dev-users-direct.mjs` instead.

3) (Quick automated verification) Run in-process verification script:

```powershell
node scripts/verify-job-lockdown.mjs
```

If the API server cannot be started locally (network issues), you can validate the auth handler directly (no network) using:

```powershell
node scripts/test-login-inject.mjs
# Use $env:TEST_EMAIL and $env:TEST_PASS to test specific credentials
# Use $env:SUPER_ADMINS to validate super admin role detection
```

Expected high-level outputs (from the verification script):
- Unauthenticated POST /api/jobs -> **401**
- User registration/login -> tokens/cookies returned
- User POST /api/jobs -> **201 Created**
- User worker.run -> **403 Forbidden**
- Super admin worker.run -> **200 OK**
- GET /api/audit -> **200** with audit events

4) Run test-suite (sanity):

```powershell
pnpm -s test
# Expect: all tests pass (26 passed, 1 skipped as in CI)
```

---

## Manual verification steps (recommended for CTO) 🧭
1) Start the secure server (see commands above).
2) Create dev users (script above) or create via the UI register flow.
3) In a browser, open the Hub/UI at: `http://localhost:4000/` (or specific pages: `/login`, `bridge-form.html`, `wizard.html`).

4) Verify authentication flows:
- Attempt a privileged action while not signed in (e.g., call `POST /api/jobs` via the UI action or curl) → you should be redirected to login and see a friendly notification: "Session expired — please sign in." and the UI should record the post-login action for replay.

5) Verify user vs super admin permission boundaries:
- Login as **dev user** and create a job via the Wizard. Expect **201 Created**.
- As the dev user, attempt to run the worker action that requires admin privileges (UI control or `POST /api/worker/run`) → Expect **403** and a friendly permission message informing required permission (e.g., `Required: jobs:write`).
- Login as **super admin** and perform the same worker action → Expect **200** and successful run; audit events should be recorded.

6) Audit verification:
- GET `/api/audit` (requires `audit:read`) — confirm entries exist for job creation, worker runs, and permission denials.

Sample curl (manual API checks):

```bash
# Unauthenticated should yield 401
curl -i -X POST http://localhost:4000/api/jobs -H "Content-Type: application/json" -d '{"type":"SEND_INVOICE","payload":{}}'

# If you have a Bearer token:
curl -i -X POST http://localhost:4000/api/jobs -H "Authorization: Bearer <token>" -H "Content-Type: application/json" -d '{"type":"SEND_INVOICE","payload":{}}'
```

> Tip: Use `node scripts/verify-job-lockdown.mjs` for a deterministic run that prints results and assertions.

---

## Verification Checklist ✅
- [ ] Secure server started with `LOCKDOWN_JOBS`, `REQUIRE_AUTH`, `ENFORCE_RBAC` enabled
- [ ] `create-dev-users.mjs` completed and both dev user and super admin accounts exist
- [ ] Unauthenticated `POST /api/jobs` returns **401**
- [ ] Authenticated dev user can **create** job (201)
- [ ] Dev user cannot perform admin actions (403)
- [ ] Operator can perform operator actions (200)
- [ ] Audit entries present for create/job/run/permission-denied
- [ ] Friendly 401 → notification & redirect to login is shown in UI
- [ ] Friendly 403 → permission message shown and logs include missing permission

**Success criteria:** All checks above pass and `scripts/verify-job-lockdown.mjs` exits with success and test suite is green.

---

## Runbook / Troubleshooting 🛠️
Problem: `node scripts/create-dev-users.mjs` fails with connection refused
- Cause: server not fully up yet or network issue
- Fix: wait 2–5 seconds and retry; check server logs for startup messages.
- Workaround: the script will automatically fall back to direct DB insertion if it cannot reach the API. You can also run `node scripts/create-dev-users-direct.mjs` to create users directly in the DB.

Problem: `create-dev-users` error about `fetch` not found
- Cause: Node too old or global fetch missing
- Fix: Use Node v18+ or run `node --experimental-fetch scripts/create-dev-users.mjs` (script already has fetch fallback in most dev setups).

Problem: 403 returned but super admin is expected to succeed
- Check `SUPER_ADMINS` environment variable — it must include the admin email
- Check server console logs for RBAC decision logs (api/lib/rbac.js outputs).

Problem: No audit entries
- Ensure `writeAudit` is wired where the action occurs (jobs, worker) — check server logs for `Audit` write events.
- Confirm DB has audit table or using mock DB (mock DB may keep audit events in memory for tests).

Useful logs and checks:
- Server stdout for `JOB_STARTED`, `JOB_SUCCEEDED`, `JOB_FAILED` messages.
- API request/response logs when running `pnpm run dev:secure`.

---

## Optional assets & quick guides 📸
- Terminal recording suggestion (cross-platform):
  - Linux/macOS: `asciinema rec demo.cast` (stop with `Ctrl-D`), upload to asciinema.org
  - Windows PowerShell: `Start-Transcript -Path .\demo-transcript.txt` before the session and `Stop-Transcript` after
- Screenshots to capture:
  - Login page + notification on 401
  - Successful job creation confirmation
  - 403 permission notification
  - Audit query showing entries
- Quick reference cheat (commands):
  - Start server: `pnpm run dev:secure`
  - Create users: `node scripts/create-dev-users.mjs`
  - Verify: `node scripts/verify-job-lockdown.mjs`
  - Run tests: `pnpm -s test`

---

## Agenda for the 30-minute CTO verification session
1) (5m) Start secure server & create dev users
2) (10m) Walk through automated verification script and review outputs
3) (10m) Manual UI checks (login, create job, try operator action as user, then as operator)
4) (3m) Confirm audit entries and discuss roll-out plan
2) (2m) Wrap-up & acceptance criteria

---

If you'd like, I can also:
- Provide a short recorded terminal session (asciinema or transcript) for the CTO
- Produce a 1-page PDF cheat sheet for the session

---

*File location:* `docs/instructions/demo-phase10-security-ctoverification.md`

If this looks good I will mark the demo materials done and prepare the optional terminal recording/screenshot assets.

---

## Recent fixes (dec 22, 2025) 🔧
- Fixed Hub login form JavaScript calling the wrong endpoint (`/auth/login` → **now** calls `/api/auth/login`). This resolves the "POST /auth/login Not Found" error reported in the verification run.
- `create-dev-users.mjs` now falls back to direct DB insertion if the API is unreachable; see `scripts/create-dev-users-direct.mjs` for an always-direct option.