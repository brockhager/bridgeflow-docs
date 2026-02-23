> [!WARNING]
> Status: Planned / In Development
> Context: Original BF-INTEGRATION Vision (Pre-Phase 30)
# Known Limitations & Constraints (Layer 1)

This is a short, pragmatic list of known constraints developers should be aware of today.

- mTLS tests are CPU/memory-heavy. We run them in an isolated Node test runner with a memory cap (see `pnpm run test:mtls`).
- Tests assume `USE_MOCK_DB=true` in many dev/test flows; some mapping-related assertions are skipped when Phase-12 models aren't present in the mock DB.
- RBAC and feature flags (`ENFORCE_RBAC`, `LOCKDOWN_JOBS`) are required to reproduce hardened behavior; some tests toggle these flags.
- The worker client and job processing logic are tested in-process (integration) but may require additional isolation for flaky environments.
- No formal OpenAPI spec exists yet — the API surface is documented informally in `API-INTERFACES.md` and test fixtures.

## TODOs
- Add a short migration/compatibility note for Phase changes (e.g., mapping model additions in Phase 12).
- Add security assessment notes for secrets/stripe/webhooks (rate-limiting thresholds, body size limits).
- Create a short runbook for troubleshooting long-running job queues and job failure modes.

