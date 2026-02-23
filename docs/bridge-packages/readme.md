# Bridge Packages — Overview

Purpose
- Bridge Packages are reusable, deployable integration templates that represent one side of a bridge (Trading Partner + Map + Connector + optional adapters).
- They capture integration intent as a single JSON `config` and are intended to be paired (left + right) in later phases.

Quick summary
- Prisma model: `BridgePackage` (see `prisma/schema.prisma`) with fields: `id`, `name` (unique), `description`, `config: Json?`, `organizationId?`, `createdAt`, `updatedAt`.
- Migration applied: `20260116082917_add_bridgepackage_config` (dev Railway DB).
- Admin API endpoints (RBAC protected):
  - GET /admin-api/bridge-packages — list (requires `admin:organizations:read`)
  - GET /admin-api/bridge-packages/:id — get one
  - POST /admin-api/bridge-packages — create (requires `admin:bridge-packages:manage`)
  - DELETE /admin-api/bridge-packages/:id — delete (requires `admin:bridge-packages:manage`)

Validation rules (Phase 42)
- `config` must include at least: `tradingPartner`, `connector`, and `map`.
- `config` is stored as JSON in the `BridgePackage.config` field.

Admin UI
- New Admin page: **Bridge Packages**
  - Route: `/bf-admin-app/packages`
  - Create modal: Name, Description, Config (JSON textarea in Part 1)
  - Delete with confirmation

Canvas Integration
- Canvas palette loads Bridge Packages via: `GET /admin-api/bridge-packages?limit=100` and renders `.palette-package` items.
- Left-side drop zone (`.package-drop-zone`) accepts a package drop and instantiates module placeholders from `package.config`.
- Right-side pairing is planned for Phase 43.

Verification & testing
- Unit tests: API handlers (`api/handlers/admin/bridgePackages.js`) include validation tests.
- Quick verification script: `scripts/verify-bridgepackage.js` (creates a test org, creates/reads/deletes a BridgePackage). Run via:

  pnpm run verify:bridgepackage

- Playwright e2e: `web/e2e/canvas-visual.spec.ts` includes canvas presence checks and screenshot capture (visual smoke).

Operational notes
- Permission scopes: `admin:bridge-packages:manage` (create/delete), `admin:organizations:read` (list/read).
- The model is intentionally simple (config JSON) to iterate quickly in Phase 42 while preserving compatibility with future normalization.

Links & files
- Prisma model: `prisma/schema.prisma` (model `BridgePackage`)
- Migration: `migrations/20260116082917_add_bridgepackage_config/migration.sql`
- API handlers: `api/handlers/admin/bridgePackages.js`
- API routes: `api/routes/adminPackages.js`
- Admin UI: `admin-bridgeflow/src/pages/PackageManager.jsx` (now labeled "Bridge Packages")
- Canvas integration: `web/src/assembly.js`
- Verify script: `scripts/verify-bridgepackage.js` (run with `pnpm run verify:bridgepackage`)

If you want this doc expanded into an operator runbook (rollback steps, backup guidance, CI checks), tell me which sections to add and I will extend it.