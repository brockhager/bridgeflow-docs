# mTLS Test Memory Issue (temporary)

**Symptom:** Running the full Vitest suite can trigger a huge memory allocation failure originating from the mTLS certificate test (`api/tests/mtls.test.js`).

**Workaround:** The mTLS test has been moved to `api/tests/_mtls.test.js.disabled` to avoid Vitest discovery; run it separately with `pnpm run test:mtls` which uses `node --test` with a 512MB memory cap.

**Next steps:**
- Revisit `api/tests/_mtls.test.js.disabled` to reduce key sizes and ensure crypto state is released after each test (add explicit cleanup and call `global.gc()` in afterEach when running under `--expose-gc`).
- Consider a small helper script `scripts/run-mtls-safely.js` to execute the test in an isolated process and capture artifacts.
