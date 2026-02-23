> [!WARNING]
> Status: Planned / In Development
> Context: Original BF-INTEGRATION Vision (Pre-Phase 30)
# Phase 38 — Blueprint Templates & Library (Plan)

**Goal:** Build a reusable Blueprint Templates library that lets customers save, version, and apply blueprint configurations (connectors, adapters, mappings, and credentials) as reusable templates. Leverage Phase 37's monitoring and Vault integration for secure template provisioning and operational visibility.

## Objectives
- Provide a template model and CRUD API for Blueprint Templates
- Allow templates to reference credential IDs (secrets are read from Vault at activation time)
- Enable versioning, validation, and enterprise gating for templates
- Instrument blueprint deployment with monitoring & alerting hooks (success rate, failures, duration)
- Provide UI for template creation, browsing, and applying templates to new bridges

## Deliverables (MVP)
1. Prisma model: `BlueprintTemplate { id, blueprintId, name, version, isEnterprise, config, createdBy, createdAt }`
2. API endpoints: CRUD + apply (`POST /api/blueprints/:id/apply-template`) with RBAC (`templates:write`, `templates:read`, `templates:admin`)
3. Template validation: server-side schema validation + dry-run activation endpoint (`POST /api/blueprints/:id/validate-template`)
4. UI components: Template browser, Save-as-template modal, Apply Template flow in Canvas
5. Metrics & Alerts: `template:apply` metrics, alert rule for repeated application failures
6. Tests: Unit tests for API, integration tests for apply flow, Playwright E2E for UI

## Security & Secrets
- Templates may include references to `credentialId` only — secret values are never embedded in templates.
- On apply/activation, adapters will retrieve secrets from the configured secret backend (Vault/mock) using the `credentialId` associated with the template.
- RBAC: only users with `templates:write` and correct org scope can create templates; only `templates:admin` can delete templates.

## Monitoring & Alerting
- Emit metrics on `template.apply` (success/failure, duration)
- Create alert rule: `template.apply.failure_rate > 5% over 5m` → notify operators
- Add dashboard panels to `/admin/metrics` for Template usage and health

## Timeline & Next Steps
- Day 1: Design Prisma model + migrations; scaffold API endpoints
- Day 2: Implement server-side validation and credential references; add tests
- Day 3: Add UI components (Save-as-template / Template browser) and E2E tests
- Day 4: Instrument metrics and create basic Grafana panels; add alert rules
- Day 5: Run full test suite, finalize docs, and prepare release notes

## Where to document
- `docs/phases/phases31-40/phase-38-plan.md` (this file)
- `docs/blueprints/` — add template UX & API examples
- `docs/releases/release-<MM>-YYYY.md` — include Phase 38 when completed

---

Let me know whether to proceed with scaffolding the Prisma model & API handlers for Phase 38 now.
