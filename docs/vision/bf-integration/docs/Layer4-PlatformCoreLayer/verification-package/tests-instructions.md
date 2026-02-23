> [!WARNING]
> Status: Planned / In Development
> Context: Original BF-INTEGRATION Vision (Pre-Phase 30)
Test reproduction instructions

1) Install deps (if needed):
   pnpm install

2) Start secure dev server (optional for manual verification):
   cross-env LOCKDOWN_JOBS=true REQUIRE_AUTH=true ENFORCE_RBAC=true pnpm run api:start

3) Provision test users (optional):
   node scripts/create-dev-users.mjs

4) Run test suite locally (headless):
   pnpm -s test

Notes:
- The test environment uses a mock DB when `USE_MOCK_DB=true` (default for `pnpm test`).
- To run a single test file, use Vitest's file matcher, for example:
   pnpm -s test -- web/tests/admin.users.test.js

Troubleshooting:
- If DOM-related tests fail, ensure `jsdom` is installed (devDependency) and run `pnpm install`.
- If you need to capture a test run artifact, run `pnpm -s test > verification-package/full-test-log.txt` and attach the file.
