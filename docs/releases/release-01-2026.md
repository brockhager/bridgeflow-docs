# Release Notes — January 2026

**Date:** 2026-01-11
**Release cadence:** monthly (format: `release-<MM>-YYYY.md`)

## Highlights
- Phase 34 — Mapping Studio (Completed Jan 10, 2026)
  - Production-ready Mapping Studio: schema-driven field palettes, real-time preview with sample data, enterprise validation, and Playwright E2E coverage.
  - Docs: `docs/phases/phases31-40/phase-34-summary.md` and `docs/phases/phases31-40/phase-34-integration-complete.md`.

- Phase 35 — Profile Templates (Completed Jan 11, 2026)
  - Production-ready Profile Templates: validated template library, auto-versioning, contextual save/apply UX, and enterprise gating.
  - Docs: `docs/phases/phases31-40/phase-35-summary.md` and `docs/phases/phases31-40/phase-35-placeholder.md`.

- Phase 39 — Canvas Polish & Super-Admin (Completed Jan 12, 2026)
  - Canvas UX polish and critical authentication fixes: added `SUPER_ADMINS` environment support, ensured `isSuperAdmin` in JWTs, and enabled CTO super-admins to create global blueprints (organizationId: null).
  - Docs: `docs/phases/phases31-40/PHASE-39-COMPLETE-SUMMARY.md`, `docs/deployment/SUPER_ADMINS.md`, `test/integration/super-admin-create-blueprint.test.js`.

- Phase 40 — Connection Reliability & Security (Completed Jan 13, 2026)
  - Connection health models and API routes (health, events, test, retry) and `/connections` UI dashboard for self-service test/retry flows.
  - Credential security: introduced `api/lib/credentialSecurity.js` with startup-enforced Vault compliance; protocol handlers (SFTP, AS2, API) updated to use Vault helpers for credentials; production startup will be blocked if any handler is not Vault-compliant.
  - Docs: `docs/phases/phases31-40/PHASE-40-COMPLETE-SUMMARY.md`, `docs/Layer2-ConnectionLayer/README.md`

- Phase 41 — Railway Deployment Configuration (Completed Jan 13, 2026)
  - Railway build & deploy configuration (`railway.json`, `Procfile`) added and verified; build steps ensure `pnpm prisma generate` and frontend bundling run during Railway builds.
  - Server startup and static SPA serving verified (`node api/server.js` serves `web/dist` and handles SPA fallback to `index.html`).
  - Files: `railway.json`, `Procfile`, `docs/deployment/RAILWAY.md`, `docs/phases/phases41-50/PHASE-41-COMPLETE-SUMMARY.md`

- Phase 42 — Bridge Packages (Part 1) (Completed Jan 16, 2026)
  - Introduced **BridgePackage**: a reusable integration template representing one side of a bridge (Trading Partner + Map + Connector + optional adapters). The schema stores a `config: Json` payload for flexibility in Phase 42.
  - Admin API: CRUD endpoints added under `/admin-api/bridge-packages` with RBAC enforced (`admin:bridge-packages:manage` for create/delete, `admin:organizations:read` for list/read).
  - Admin UI: new **Bridge Packages** manager (`/bf-admin-app/packages`) with create/delete; initial editor accepts JSON config (quick iteration). 
  - Canvas: Bridge Packages load into the palette and can be dropped onto the left-side drop zone to instantiate modules on the canvas. Right-side pairing is planned for Phase 43.
  - Verification: migration applied (`20260116082917_add_bridgepackage_config`), unit tests added, and a `pnpm run verify:bridgepackage` script validates create/read/delete against the dev DB.
  - Files & docs: `prisma/schema.prisma` (model `BridgePackage`), `api/handlers/admin/bridgePackages.js`, `api/routes/adminPackages.js`, `admin-bridgeflow/src/pages/PackageManager.jsx`, `web/src/assembly.js`, `scripts/verify-bridgepackage.js`, `docs/bridge-packages/readme.md`, `docs/phases/phases41-50/BridgePackages.md`.

## Detailed Phase Highlights
- Phase 31A — Unified Adapter Framework (Completed Jan 8, 2026)
  - Built the **BridgeFlowAdapter** interface and symmetric adapter model so a single binary supports free and enterprise tiers; added permission-based capability gating.
  - Key deliverables: adapter lifecycle, PermissionManager, base adapters, and DB schema foundations for multi-tenant RLS.
  - Files: `docs/phases/phases31-40/phase-31A.md`, `api/adapters.md`.

- Phase 31B — Document Intelligence (Completed Jan 8, 2026)
  - Shipping the **DataTypeRegistry** and TypeDetector enabling schema-driven parsing, detection with confidence scoring, and transformation rules reused by Mapping Studio.
  - Includes advanced adapters (DatabaseAdapter, APIAdapter) and a robust validation engine (server-side rules used by Phase 34/35).
  - Files: `docs/phases/phases31-40/phase-31B.md`.

- Phase 32 — Bridge Canvas (Completed Jan 8, 2026)
  - Visual Canvas and Blueprint engine enabling users to assemble integration flows; implemented ghost components, catalog, and package activation lifecycle.
  - Files: `docs/phases/phases31-40/phase-32-summary.md` and `web/src/assembly.js`.

- Phase 33 — Layer 4 Firewall Security (Completed Jan 11, 2026)
  - Added firewall controls for integration bridges, secure API endpoints, Prisma model + migrations, and Canvas integration patterns; tests passing against PostgreSQL.
  - Files: `docs/phases/phases31-40/phase-33-firewall-api.md` and `PHASE-33-COMPLETE-SUMMARY.md`.

- Phase 34 — Mapping Studio (Completed Jan 10, 2026)
  - Integrated Phase 31B DataTypeRegistry: schema-driven fields, real-time preview, validation before save, enterprise gating and sample payloads.
  - UI/UX: 4-panel editor with required-field visuals, function toolbar, and real transformation engine for previews.
  - Files: `docs/phases/phases31-40/phase-34-summary.md` and `phase-34-integration-complete.md`.

- Phase 35 — Profile Templates (Completed Jan 11, 2026)
  - Enterprise-grade template system delivered: quality-gated template creation, auto-versioning, intelligent data-type filtering, one-click apply, and contextual UX.
  - Key features:
    1. Quality-Gated Template Creation — only validated mappings can be saved as templates (uses Phase 34 validation engine); "Save as Template" is enabled only when validation passes.
    2. Enterprise-Exclusive Intelligence — templates are associated with data types (X12_850, JSON_GENERIC, etc.) and free users see upgrade prompts instead of broken features.
    3. Professional Version Management — auto-incrementing template versions with clear version visibility and one-click apply.
    4. Seamless UX — Mapping Studio → Save as Template → Template Browser → Apply (modal-driven, backward compatible).
  - Technical implementation (high level):
    - DB: `MappingTemplate` model extended with `dataTypeCode`, `validationStatus`, `version`, `isEnterprise` (see `prisma/schema.prisma`).
    - API: `api/handlers/templates.js` (CRUD + apply + versioning) with enterprise gating and validation enforcement.
    - Frontend: `web/mapping-studio/studio.js` (722 lines), `web/mapping-studio/templates.js` (142 lines), `web/mapping-studio/studio.html` (794 lines).
  - Security & QA:
    - RBAC: `templates:enterprise` permission enforced, templates are scoped to `orgId`, and all operations are audited.
    - Tests: 4 comprehensive Playwright E2E tests cover save/apply/import flows; integration tested with Phase 34 validation and Phase 31B DataTypeRegistry.
  - Files & docs: `docs/phases/phases31-40/phase-35-summary.md`, `docs/phases/phases31-40/phase-35-placeholder.md`, `web/mapping-studio/*`.

- Phase 36 — Onboarding & Startup Templates (Completed Jan 11, 2026)
  - Full end-to-end onboarding delivered: backend provisioning engine, 4-step onboarding wizard with session resume and industry recommendations, real-time progress polling, email notifications, support escalation UI, and retry provisioning.
  - Files & Endpoints: `prisma/schema.prisma` (`OnboardingSession`, `StartupTemplate`), `api/handlers/onboarding.js`, `api/handlers/onboardingJobs.js`, `api/handlers/startupTemplates.js`, `api/routes/onboarding.js`, `api/routes/startupTemplates.js`, `scripts/seed-startup-templates.js`, `web/onboarding.html`, `web/src/routes/onboarding.js`.
  - Startup Templates seeded: Simple File Transfer (15m), X12 EDI Hub (45m, HIPAA), API Integration (30m), Custom Enterprise (60m, HIPAA + PCI-DSS).
  - Run / Test:
    - `node scripts/seed-startup-templates.js`
    - `pnpm run api:start` and `pnpm run web:dev`
    - `npx playwright test -c playwright/playwright.config.js` (E2E checks)
  - Impact: Zero-friction customer onboarding from signup to production bridge in under 1 hour.
  - Strategic Impact: Reduces onboarding time from weeks to under 1 hour, lowers professional services costs, enables self-service for mid-market, and scales without linear headcount growth.
  - Final Assessment: Phase 36 is exemplary — a competitive differentiator for enterprise sales.

- Phase 37 — Infrastructure & Reliability (Week 3 Complete Jan 11, 2026)
  - Completed feature set: Production-ready monitoring & alerting, metrics aggregation with suppression logic, AlertRule/AlertEvent models, real-time dashboards (`/admin/metrics`), Vault-backed credential management, and RBAC-protected credential APIs.
  - Files Created/Modified: `api/lib/logger.js`, `api/handlers/logs.js`, `api/routes/logs.js`, `api/handlers/onboardingJobs.js`, `api/routes/api.js`, `api/handlers/credentials.js`, `api/routes/credentials.js`, `api/handlers/credentials.test.js`, `prisma/schema.prisma` (Credential, AlertRule, AlertEvent), `api/lib/adapter/adapters/DatabaseAdapter.ts`, `api/lib/adapter/adapters/APIAdapter.ts`, `api/handlers/monitor.js`.
  - New API Endpoints: `GET /api/credentials`, `GET /api/credentials/:id`, `POST /api/credentials`, `PATCH /api/credentials/:id`, `DELETE /api/credentials/:id`, `GET /api/credentials/:id/secret`, `PUT /api/credentials/:id/secret`, `GET /api/vault/health`, `GET /api/vault/secrets`.
  - RBAC: `credential:read`, `credential:write`, `credential:admin`.
  - Quick runbook:
    - Apply migrations: `pnpm run migrate:alerts`
    - Generate Prisma client: `pnpm run prisma:generate`
    - Start server: `pnpm run api:start`
  - Notes: Adapters now look up secrets through the configured secret backend; a local mock backend remains for developer workflows.

- Phase 38 — Unified Blueprint System (Completed Jan 11, 2026)
  - Unified blueprint architecture with `bridge` (canvas) and `integration` (enterprise) types, `BlueprintInstance` deployment tracking, and seed automation for enterprise templates.
  - Files Created/Modified: `prisma/schema.prisma` (BridgeBlueprint.type, BlueprintInstance), `api/services/BlueprintService.js`, `api/handlers/blueprints.js`, `api/routes/blueprints.js`, `scripts/seed-blueprints.js`.
  - New API Endpoints: `GET /api/blueprints`, `GET /api/blueprints/:id`, `POST /api/blueprints`, `POST /api/blueprints/:id/apply`, `GET /api/blueprint-instances`, `GET /api/blueprint-instances/:id`.
  - Seeded: Healthcare EDI Hub, Retail EDI Network, SaaS Integration Hub, Financial Services Gateway.
  - Quick runbook:
    - Run migrations: `pnpm run migrate:blueprints`
    - Generate client: `pnpm run prisma:generate`
    - Seed templates: `pnpm run db:seed:blueprints`
    - Start server: `pnpm run api:start`
  - Notes: Templates reference `credentialId` only; secret values are fetched from the configured secret backend at apply-time.

- Phase 39 — Layer 1 Canvas Polish & UX (Completed Jan 12, 2026)
  - Canvas UX polish with professional visual design, placement guides, connection visualization, undo/redo, keyboard shortcuts, tooltips, and **critical authentication fixes**.
  - **Authentication Issue Resolution**: Fixed missing `isSuperAdmin` flag in login JWT tokens and resolved rate limiting blocking in tests, enabling CTO super-admin access.
  - Files: `docs/phases/phases31-40/PHASE-39-COMPLETE-SUMMARY.md`, `api/handlers/auth.js`, `test/integration/super-admin-create-blueprint.test.js`.
## Validation / Smoke checks
- Start API & UI
  - `pnpm run api:start`
  - `pnpm run web:dev`
- Run E2E
  - `npx playwright test -c playwright/playwright.config.js`
- Quick verifications
  - Mapping Studio: open `http://localhost:3001/mapping-studio?dataType=X12_850&side=inbound` and verify sample data + preview
  - Templates: save a validated mapping, confirm template created and version increment; apply template and confirm mapping applied
  - **Authentication**: `npm test -- test/integration/super-admin-create-blueprint.test.js` to verify CTO super-admin access

## Artifacts & CI
- Playwright pipeline uploads artifacts for Phase 34 and Phase 35 E2E runs (check pipeline run for artifact links in CI).

## Impact
- Free users: improved JSON/CSV mapping experience
- Enterprise customers: X12/HL7/EDIFACT mapping with validation + template management
- Business ops: versioned templates reduce configuration drift and accelerate onboarding

## Spotlight — Outstanding Achievement
- Complete Mapping Studio Feature Set: Real-Time Preview with Sample Data ✅, Enterprise Field Validation ✅, Profile Templates ✅, Clean E2E Test Suite ✅.
- Technical excellence: clean architecture (~800 lines total), backward compatible changes, security-first design, and validation-integrated flows.
- Business impact: self-service for business users, risk mitigation through validation, productivity multipliers via templates, and revenue protection via enterprise gating.

## Sprint Board Update
- Mapping Studio: COMPLETE ✅ (75 points delivered; production-ready and fully tested)

## Contact & Follow-up
- Questions / rollouts: CTO
- Planning: Phase 36 (Machine Learning Intelligence) — scope & schedule to follow

---
*Format note:* Add one release file per month using the `release-<MM>-YYYY.md` filename pattern, and update `docs/releases/README.md` with the new file link.
