Title: Phase 16: Permanent fix for Vitest exclusion of Node.js/Playwright tests

Description:
Currently using file renames and temporary placeholders to prevent Vitest from collecting non-Vitest test files (e.g., Node.js `node:test` runner and Playwright scripts). We need a permanent configuration change so Vitest excludes `**/node-tests/**` and `**/playwright/**` patterns (or otherwise only collects `test/**/*.test.js` and similar).

Acceptance criteria:
- Add a robust Vitest configuration (`vitest.config.js`) or workspace-level settings to exclude the Node and Playwright test files from Vitest collection.
- Remove the need for file renames or placeholder guards in code.
- Add tests/documentation ensuring non-Vitest runners are protected from Vitest collection regressions.

Labels: phase-16, tech-debt, testing
Priority: Medium

Notes:
- This is follow-up tech debt from the test-runner upgrade; fix should preserve current CI behavior and add a regression test if feasible.
