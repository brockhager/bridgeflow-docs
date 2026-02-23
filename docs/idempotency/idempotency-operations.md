# Idempotency Operations & Monitoring

## Daily Pruning
- Runs: recommended 3 AM UTC (cron: `0 3 * * *`)
- Deletes: keys older than `IDEMPOTENCY_TTL_HOURS` (default: 24)
- Command: `pnpm run prune:idempotency` (runs `scripts/prune-idempotency-keys.js`)
- Metrics emitted: `idempotency.keys_pruned`, `idempotency.prune_job.non_empty`, `idempotency.prune_job.errors`, `idempotency.ttl_hours`

## Key Metrics
- `idempotency.duplicate_prevented`: Duplicate requests blocked by business logic
- `idempotency.replayed`: Stored responses reused from idempotency store
- `idempotency.lookup_time_ms`: Histogram for idempotency lookup latency
- `idempotency.keys_pruned`: Number of keys pruned by the prune job

## Alerting Thresholds
- Warning: >1000 unpruned keys after job run
- Critical: Pruning job fails 3 consecutive times

## Operational Notes
- The prune job is designed to be best-effort. If the DB is unavailable, it will fail and increment the `idempotency.prune_job.errors` metric.
- In test environments we use the in-memory mock DB; the script detects `USE_MOCK_DB=true` and safely exercises the mock APIs.
- Use `pnpm run metrics:report` to print a quick metrics summary for the last hour.
