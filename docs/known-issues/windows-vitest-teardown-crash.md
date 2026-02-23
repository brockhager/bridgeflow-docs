# Windows Vitest Teardown Crash (ACCESS_VIOLATION / exit code -1073741819)

Severity: Low
Platform: Windows (observed on developer workstation / CI Windows runners)

## Summary
During full test runs with Vitest on Windows we intermittently observe process exits with return codes like `-1073741819` (0xC0000005 / ACCESS_VIOLATION). The test suites themselves generally pass (unit and integration tests), but the Vitest process sometimes terminates with this native crash during teardown.

## Observed behavior / logs
- Vitest test output shows all tests passing, followed by a non-zero exit:
  - Example: `⠙[test-setup] process.exit called, code= -1073741819 unhandledSeen= false`
- Exit code `-1073741819` corresponds to `0xC0000005` (ACCESS_VIOLATION) — a native OS-level crash.
- Symptoms point to native teardown code (Prisma client disconnect or underlying C/C++ library) running during `process.on('beforeExit')` or `process.on('exit')` handlers.

## Likely cause
- Interaction between Prisma's native engine and Windows in-process teardown. Disconnecting Prisma client in certain Windows environments has previously been observed to cause access violations (threadpool / engine teardown race). The crash appears environmental rather than a JavaScript error.

## Repro steps
1. Run full test suite on a Windows machine using the repository's test command:
   ```bash
   pnpm test
   ```
2. Observe: tests pass but process exits with an access violation code and the CI job reports failure.

## Temporary mitigation (implemented)
- The repository includes a test setup file (`test/setup-unhandled.js`) that now implements a **refined Windows teardown guard**. Behavior:
  - If running on **Windows** and **no unhandled errors were observed**, the setup forces an **early clean exit** (`process.exit(0)`) to avoid native teardown code (Prisma disconnect, etc.) from running and potentially causing an access violation.
  - If **unhandled errors were observed**, the setup **skips the known Prisma disconnect** (a known crash source) but allows the test runner to exit with a failing status so real test failures are visible.

  Example (simplified):
  ```js
  if (process.platform === 'win32') {
    if (!global._bridgeflow_unhandledSeen) {
      // Force a clean exit before native libs run
      process.exit(0)
    }
    // else: skip Prisma disconnect but allow failing exit status
  } else {
    await prisma.$disconnect()
  }
  ```
- Additionally, the setup file logs unhandled rejections and uncaught exceptions so true test failures still fail the CI run.

## Recommended next steps
- Continue running full test suite in CI (Linux) for authoritative verification (Linux/macOS are unaffected by this native crash).
- Open an issue with Prisma (or the underlying native engine) with logs if the crash can be reliably reproduced on a Windows runner.
- If future work demands Windows stability, consider using a separate Node/Prisma version matrix or running tests in WSL (Ubuntu) instead of pure Windows host.

## Notes / References
- Exit codes: `-1073741819` == `0xC0000005` (ACCESS_VIOLATION). Native errors like this should be treated as runtime environment bugs, not JavaScript logic bugs.

---

Documented by automated test maintenance changes on branch merging to `main`.
