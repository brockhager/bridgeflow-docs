> [!WARNING]
> Status: Planned / In Development
> Context: Original BF-INTEGRATION Vision (Pre-Phase 30)
# Known Issues — Admin Bridgeflow (Phase 13)

This file tracks known limitations and test blockers relevant to the Admin Bridgeflow release.

## Phase 13 known items

- api/tests/users.test.js — Vite transform failure
  - Symptom: Vitest fails to parse import graph for `api/server.js` when running this suite; the transform error prevents collection and execution.
  - Impact: Test file excluded from Phase 13 gating; backend admin functionality remains demo-ready.
  - Next step: Bisect imports in `api/server.js` to locate file that triggers Vite parser failure; correct file extension or adjust Vite optimize/exclude settings.

- api/tests/worker.integration.test.js — process-level memory allocation failure
  - Symptom: Full-suite runs hit multi-terabyte allocations and abort partway through.
  - Impact: Integration test not run for Phase 13; worker behavior should be manually smoke-tested.
  - Next step: Isolate the test(s) causing unbounded growth (large fixtures, loops, or mock accumulation), add safety guards and reset test state in `beforeEach`.

- test/worker.import.test.js — import-only test reproduces server import transform error
  - Use this file to reproduce and iterate on fixes without running the whole worker suite.

- Admin JSDOM flakiness (admin-bridgeflow tests)
  - Some React JSDOM tests warn about `act(...)` usage and one local assertion failed in CI; adjust test environment or replace deprecated APIs.

## Operational mitigations
- For Phase 13, the two test files are excluded in `package.json` vitest config; they are scheduled for Phase 14 triage.
- A `test/setup.js` file was added to wipe `mockDb` and in-memory metrics to prevent cross-test leakage.

If you discover a new blocker during the demo, please add it here and note whether it is critical for customer onboarding or Phase 14 work.

