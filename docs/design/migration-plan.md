# Migration Plan: tenant_id -> schema/db-per-tenant

This is a pragmatic, staged migration plan designed to avoid downtime and provide rollback options. Keep migrations idempotent and script-driven.

## Phases

### Phase 0 — MVP (shared schema with tenant_id)
- Enforce tenant filters in repository layer and test for tenant isolation
- Add `TenantDescriptor` and `TenantManager` to centralize tenant metadata
- Add operator tools to tag heavy tenants for future isolation

### Phase 1 — Prepare (introduce schema-per-tenant capabilities)
- Add schema management utilities in `lib-db` and small migration worker service
- Implement per-tenant schema templates and migration pipelines
- Add status tracking for tenant migration state (pending, in-progress, completed, failed)

### Phase 2 — Migrate selected tenants (schema-per-tenant)
- For a single tenant:
  - Create schema and apply base migrations
  - Dual-write: update application layer to write to both shared and tenant schema
  - Backfill: run data copy from shared schema to tenant schema with validation (checksums, counts)
  - Swap reads via feature flag when validation passes
  - Monitor for data divergence for a period (e.g., 24-72 hours)
  - Cut over reads fully and disable dual-write after confident
- Repeat per tenant; prefer non-critical tenants first

### Phase 3 — DB-per-tenant (enterprise)
- Provision dedicated DB instance or cluster per tenant (automated via IaC)
- Implement connection pooling and operator limits
- Ensure backup/restore and per-tenant recovery procedures exist

---

## Patterns & Best Practices

- Dual-Write & Read-Fallback
  - Dual-write to old and new models, and read from old by default until validation completes
  - Ensure writes are idempotent and have conservative error handling

- Backfill & Validation
  - Use incremental bulk copy with consistency checks (row counts, checksums)
  - Record migration checkpoints and resume support

- Transactional Guarantees
  - For operations that cross multiple tables, ensure transactional semantics in the target schema
  - Do not allow cross-tenant joins (explicitly ban in code reviews and tests)

- Testing
  - Add migration tests that run on test tenants and verify data parity
  - Add chaos tests to simulate partial failures (e.g., network blips) during migration

- Rollback
  - If copy fails: mark tenant state as `failed` and resume later
  - If production divergence occurs: re-enable reads from shared schema and investigate

---

## Operational Runbook (example)
1. Pre-checks: ensure nightly backup succeeded and target schema has been created
2. Start migration job in `dry-run` mode to capture expected differences
3. Start backfill; monitor metrics and queue sizes
4. Run validation checks; escalate on failures
5. Switch reads behind feature flag
6. Monitor for N days; if stable, disable dual-write

---

## Tooling Recommendations
- `migration-worker` service to perform backfills and monitor progress
- `migration-cli` as operator tool to trigger and supervise migrations
- `migration-audit` into `audit-service` for every step

---

## Risks & Mitigations
- Risk: performance hit during dual-write/backfill
  - Mitigation: throttle backfill, schedule during low traffic windows
- Risk: data divergence
  - Mitigation: strong checksums, incremental validation, and ability to resume
- Risk: cost explosion (many DBs)
  - Mitigation: tiered offering — charge premium for dedicated infra

---

Next steps: create `migration-worker` stub, implement migration-status UI in operator console, and create runbook tests for the first tenant migration in staging.
