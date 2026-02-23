# BridgeFlow Documentation Index

All design and architecture docs live under `/docs/`.

Beginner guides (start here)

- [Beginner guides](beginner-docs/README.md) — Short, role-based quickstart (pick Developer, Customer Admin, or End User).
  - [Developer (bf_employee)](beginner-docs/developer/README.md) — Developer quick start.
  - [Customer Admin](beginner-docs/customer-admin/README.md) — Customer admin quick start (managing blueprints & orgs).
  - [End User](beginner-docs/user/README.md) — End-user quick guide (non-technical users).

Phases (development roadmap & detailed specs)

- [Phases index](phases/readme.md) — Phase index (groups & links)
  - [Phases 1-10: Foundation & Core Platform](phases/phases1-10/README.md)
  - [Phases 11-20: Platform Foundation & Enterprise Features](phases/phases11-20/README.md)
  - [Phases 21-30: Advanced Features & Unified Experience](phases/phases21-30/README.md)
  - [Phases 31-40: Advanced Integration & Intelligence](phases/phases31-40/README.md)

Layers (architecture by layer)

- [Layer0 — Admin & internal tooling](Layer0-Admin-Bridgeflow/README.md) — Admin console and internal tooling (dev routes, admin workflows)
- [Layer1 — Business Layer](Layer1-BusinessLayer/README.md) — Business entities and UIs (Trading Partners, Bridges, Canvas)
- [Layer2 — Connection Layer](Layer2-ConnectionLayer/README.md) — Connectors, Endpoints, protocol scaffolding (AS2, SFTP, API)
- [Layer3 — Data Mapping Layer](Layer3-DataMappingLayer/README.md) — Mapping engine, mapping versions, transforms
- [Layer4 — Platform Core Layer](Layer4-PlatformCoreLayer/README.md) — Core services, workers, idempotency, metrics
- [Layer5 — Infrastructure Layer](Layer5-InfrastructureLayer/README.md) — Deployment, monitoring, infra and k8s manifests

Quick links:

- Design docs
  - [Monorepo layout & rationale](design/monorepo-structure.md)
  - [Concrete workspace tree example](design/monorepo-sample-tree.md)
  - [Local development (no Docker required)](design/local-dev-no-docker.md)

Release notes

- [Release notes](releases/README.md) — Monthly release notes and how-to add one
  - Current: [January 2026 — release-01-2026](releases/release-01-2026.md)

Key references (use these often)

- Onboarding & orientation: `docs/ONBOARDING.md`
- Architecture overview: `docs/ARCHITECTURE.md`
- Glossary: `docs/glossary/README.md` (important for consistent terminology)
- AI/Agent guidance: `.github/copilot-instructions.md` (how agents should work in this repo)
- Tests & DB reset: `test/utils/resetDb.js` (must be called in each test file)
- Railway setup: run `pnpm run railway:setup` to provision / verify the canonical PostgreSQL DB used by tests and CI

Guidelines:
- Keep documentation concise and actionable.
- Add new design artifacts under `/docs/` and update this index when you add a new area.
- Use PRs or discuss changes with the repo owner for architectural decisions.

Notes & conventions
- Database: Railway-hosted PostgreSQL is the canonical DB for dev/test/CI (do not add SQLite fallbacks).
- Coding style: ESM-only (`import` / `export`).
- Branching: confirm with repo owner — many changes are pushed directly to `main`.

If you want these design docs moved to the repository root (e.g., `/docs/monorepo-structure.md`), say so and I will move them.
