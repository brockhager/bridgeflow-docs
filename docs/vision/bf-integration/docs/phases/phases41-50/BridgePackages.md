> [!WARNING]
> Status: Planned / In Development
> Context: Original BF-INTEGRATION Vision (Pre-Phase 30)
# Phase 42 — Bridge Packages (Part 1)

Objective
- Introduce "Bridge Packages": single-sided integration templates that encode a Trading Partner, Map, Connector and optional adapters as a `config` JSON blob.
- Deliver a secure admin experience to create/manage packages and a canvas integration so packages can be dragged onto the workspace and instantiated.

Scope (Part 1)
- Data model: `BridgePackage` Prisma model with `config: Json?`.
- Admin API: CRUD endpoints with RBAC and simple validation (require TP + Connector + Map).
- Admin UI: `/bf-admin-app/packages` page with Create Modal (JSON config field) and Delete.
- Canvas: Left-side package drop zone + palette population from `/admin-api/bridge-packages`.
- Testing: Unit tests for handlers and a `verify:bridgepackage` script to validate end-to-end data flow.

Why this approach?
- Keeps the mental model simple (pick a package, drop it, the canvas is populated with a complete side of a bridge).
- Avoids premature normalization — config JSON allows rapid iteration and simple migration path to normalized tables later.
- Prevents naming collisions with existing `Package` (data payloads) by using `BridgePackage`.

Design notes & decisions
- Naming: `BridgePackage` is explicit and avoids confusion with in-flight data `Package` payloads.
- Validation: server-side check enforces minimal completeness (TP + Map + Connector) to avoid unusable packages.
- Admin UX: initial editor uses a JSON textarea for speed; future iterations will replace it with pickers.
- Canvas: supports left-side package only in Phase 42 (right-side and pairing in Phase 43).

Deliverables (done)
- Prisma model and migration: `BridgePackage` with `config` JSON field — migration applied to dev DB.
- `api/handlers/admin/bridgePackages.js` and `api/routes/adminPackages.js` routes registered.
- Admin page: `admin-bridgeflow/src/pages/PackageManager.jsx` (titled Bridge Packages).
- Canvas integration and tests: `web/src/assembly.js`, `web/tests/assembly.packages.test.js`, `web/e2e/canvas-visual.spec.ts`.
- Verification: `scripts/verify-bridgepackage.js` and `pnpm run verify:bridgepackage`.

Out of scope for Part 1
- Right-side drop zone & bridge pairing (Phase 43)
- Normalized DB schema (TP/Map/Connector as separate tables) — may be considered in Phase 43
- Marketplace / versioning / sharing

Next steps (Phase 43 starter list)
1. Add right-side package drop zone and 1:1 pairing logic.
2. Replace JSON textarea with selectors: Trading Partner, Map (transform), Connector type, Adapters.
3. Persist bridge state and add validation between left and right sides.
4. Add UI e2e Playwright tests for create → drop → deploy flows.

Acceptance criteria for Phase 42 Part 1
- Dev DB migration exists and Prisma client is regenerated.
- Admin can create/delete BridgePackages and they show up in the palette.
- Dropping a BridgePackage on the left-side drop zone instantiates modules on the canvas.
- Verification script (`pnpm run verify:bridgepackage`) passes against dev DB.

Notes
- Migration: `20260116082917_add_bridgepackage_config`
- Permission: `admin:bridge-packages:manage` for create/delete
- Keep the team informed if we move from config JSON to normalized models — plan a migration path and tests.

Owners
- Feature owner: Brock (CTO)
- Implementer: Agent4 (this repository)

Status: Completed — Phase 42 Part 1 closed and ready for pilot.
