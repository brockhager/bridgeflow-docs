# BridgeFlow Monorepo Structure Proposal

Summary
- Primary stack: **TypeScript / Node.js** for services and libs
- Monorepo using **pnpm workspaces** + **Turborepo** (or Nx) for orchestration
- Prefer **Prisma** for DB schema + migrations (PostgreSQL)
- Local dev that does not *require* Docker; optional Docker helpers for convenience
- CI: **GitHub Actions** with lint/test/build/scanning steps

Goals & Constraints
- Small team: prefer simple conventions and battle-tested tools
- SaaS: we operate infra; design for multi-tenancy and security from day 1
- Start with tenant_id shared schema; design to migrate to schema/db-per-tenant
- No complex Docker orchestration required for local dev

Top-level layout (proposal)

```
/ (root)
├─ package.json                # workspace scripts
├─ pnpm-workspace.yaml
├─ turbo.json                  # task runner
├─ .github/workflows/*         # CI pipelines
├─ packages/
│  ├─ services/
│  │  ├─ api-gateway/
│  │  ├─ tenant-service/
│  │  ├─ connector-service/
│  │  ├─ workflow-service/
│  │  ├─ billing-service/
│  │  └─ audit-service/
│  └─ libs/
│     ├─ db/                   # db adapters, migrations, Prisma schema templates
│     ├─ auth/                 # auth helpers, middleware
│     ├─ observability/        # tracing/metrics/logging helpers
│     ├─ secrets/              # secrets manager abstraction + dev shim
│     └─ shared/               # shared types, utilities
├─ design/                     # design docs (this folder)
└─ docs/
```

Package responsibilities
- services/api-gateway: Edge, auth, rate limiting, routing to internal services
- services/tenant-service: tenant lifecycle, TenantManager, onboarding
- services/audit-service: immutable event logging, retention/archival
- services/connector-service: integrations (QuickBooks, HubSpot, etc.)
- services/workflow-service: orchestration, long-running jobs
- services/billing-service: usage collection, billing, invoicing
- libs/db: repository interfaces, connection managers, migration helpers
- libs/auth: `RequestContext`, auth middleware, token validation
- libs/observability: OTEL instrumentation, metric helpers
- libs/secrets: Secrets manager interface + dev/local shim
- libs/shared: domain types, errors, results

Tooling choices (rationale)
- pnpm workspaces: fast installs and strictness; good for monorepo
- Turborepo: task orchestration and caching; Nx is an alternative
- TypeScript strict mode: no `any` for security-critical code
- Prisma: fast developer experience, type-safe DB access, and migrations
- Vitest + Supertest / Playwright: unit & integration tests
- ESLint + Prettier: code style & guardrails
- OpenTelemetry (OTEL): tracing + metrics (exporters pluggable)

Local development (no Docker)
- Option A (recommended): Use a managed dev Postgres instance (e.g., Supabase dev project) and a `.env.development` file pointing to it.
- Option B (local Postgres): install Postgres locally (Windows: Postgres installer or WSL), then run migrations locally.
- Tests: Use `pg-mem` for fast unit tests that emulate Postgres behavior (no Docker needed).

Dev scripts (examples)
- `pnpm dev --filter services/*` - run all services in parallel (or use a single service filter)
- `pnpm -w run migrate:dev --filter libs/db` - run migrations against the configured DB
- `pnpm test` - run unit tests across workspace

Security & Compliance hooks
- Central `libs/audit` for append-only audit events; write-only via API with RBAC
- Secrets accessed via `libs/secrets` interface; production implementation uses KMS/Secrets Manager
- Logging standard: structured JSON, includes `requestId`, `tenantId`, `principal.id`
- All security-critical env must be read from secrets store in production (not raw env)
- Field-level encryption: `libs/secrets` + `libs/db` utilities with encrypt/decrypt helpers

Migration Path from tenant_id -> schema/db-per-tenant
- Start: shared schema `tenant_id` enforced at repository layer
- Plan: add `TenantDescriptor` + `TenantManager` (metadata), allow marking tenant isolation level
- Tools: migration jobs to copy per-tenant data to new schema; use dual-write strategy during cutover
- Long-term: automated provisioning (schema creation, migrations, backups) when moving to schema/db per tenant

Operational & CI decisions
- GitHub Actions pipeline: lint, test, build, dependency-scan, image-scan (if images used later)
- PR policy: require codeowners + security checklist in PR template
- Release: Canary or blue/green deployment for services when possible

Notes: Keep the design flexible — most heavy infra (multi-region, DB per tenant) should be behind feature flags and admin-only workflows until required.
