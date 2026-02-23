# Jobs Lockdown Live Demo — Verification Steps

Purpose: Live demonstration checklist to verify Jobs lockdown in dev (LOCKDOWN_JOBS=true).

Pre-reqs:
- Server host: http://localhost:4000
- Ensure these env vars are set when starting the API:
  - LOCKDOWN_JOBS=true
  - REQUIRE_AUTH=true
  - ENFORCE_RBAC=true
  - (Optional) SUPER_ADMINS=dev-op@example.com

Start secure server (example):
- Windows (PS):
  ./scripts/start-secure-dev.ps1
- Cross-platform:
  cross-env LOCKDOWN_JOBS=true REQUIRE_AUTH=true ENFORCE_RBAC=true pnpm run api:start

Provision dev users (when server is running):
- node scripts/create-dev-users.mjs
  - Default accounts: dev-user@example.com, dev-op@example.com (password: Password123!)

Quick curl examples (replace token values):

1) Attempt unauthenticated create job (expect 401):

curl -sv -X POST http://localhost:4000/api/jobs -H 'Content-Type: application/json' -d '{"customers":["a@example.com"]}'

2) Login and obtain token (regular user):

curl -sv -X POST http://localhost:4000/api/auth/login -H 'Content-Type: application/json' -d '{"email":"dev-user@example.com","password":"Password123!"}'

- Copy `token` from response JSON

3) Create a job with user token (expect 201):

curl -sv -X POST http://localhost:4000/api/jobs -H "Authorization: Bearer <TOKEN>" -H 'Content-Type: application/json' -d '{"customers":["a@example.com"]}'

4) Query audit events for the job (expect >=1):

curl -sv -X GET "http://localhost:4000/api/audit?jobId=<JOB_ID>" -H "Authorization: Bearer <TOKEN>"

5) Attempt admin-only action with user token (expect 403):

curl -sv -X POST http://localhost:4000/api/worker/run -H "Authorization: Bearer <TOKEN>" -H 'Content-Type: application/json' -d '{"limit":1}'

6) Super admin runs the worker (admin token; expect 200):

curl -sv -X POST http://localhost:4000/api/worker/run -H "Authorization: Bearer <OP_TOKEN>" -H 'Content-Type: application/json' -d '{"limit":1}'

Demo checklist (pass/fail):
- [ ] Unauthenticated access blocked
- [ ] User can create job using token
- [ ] User forbidden to run worker
- [ ] Super admin can run worker
- [ ] Audit contains job events
- [ ] Wizard flow in browser (canvas/wizard) can complete when logged in

Notes & Troubleshooting:
- If `node scripts/create-dev-users.mjs` returns connection errors, wait for server to fully start or use the in-process verification script: `node scripts/verify-job-lockdown.mjs`
- If admin run returns 403, ensure `SUPER_ADMINS` includes the admin email, or run manual login and check token `isSuperAdmin` claim.

Reporting:
- Record any UX oddities (e.g., login cookie path issues), server errors, or missing audit events.
- If any failure, revert `LOCKDOWN_JOBS` to false in dev to unblock demonstration and fix issues.

Contact: Agent4 (on team channel) for immediate fixes.