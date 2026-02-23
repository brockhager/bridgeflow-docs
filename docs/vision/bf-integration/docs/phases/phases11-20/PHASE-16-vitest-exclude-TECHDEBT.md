> [!WARNING]
> Status: Planned / In Development
> Context: Original BF-INTEGRATION Vision (Pre-Phase 30)
Title: Temporary workaround for Vitest collection of non-Vitest test files

Summary:
- Problem: Vitest attempts to collect files that are intended to be run by other test runners (Node's `node:test` and Playwright). This caused collection failures (`No test suite found in file`) and non-zero CI exit codes.
- Short-term fix applied (temporary):
  - Renamed `api/node-tests/mtls.test.js` -> `api/node-tests/mtls.node.js` to avoid Vitest collecting the file.
  - Renamed `scripts/playwright/playwright-clear-load-regression.test.js` -> `scripts/playwright/playwright-clear-load-regression.playwright.js` to avoid Vitest collection.
  - Updated `package.json` `test:mtls` script to reference the new mtls filename.

Next steps / Technical debt (Phase 16):
- Investigate why Vitest exclusions (`vitest.test.exclude` in `package.json`) are not preventing collection for these files.
- Either: (A) fix Vitest configuration so files under `api/node-tests/**` and `scripts/playwright/**` are reliably excluded; or (B) move node-only and Playwright test files into dedicated folders outside Vitest discovery patterns.
- Revert the temporary filename changes when a robust config is in place.

Owner: @team (create an issue and reference this doc when you pick it up)
Date: 2025-12-27

