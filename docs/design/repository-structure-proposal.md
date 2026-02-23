# BridgeFlow Repository Structure Proposal

Status: Draft — feedback welcome

## Summary
- Stack: **TypeScript / Node.js** (v1.x) across services and libs
- Monorepo using **pnpm workspaces** + **Turborepo** for task orchestration
- Primary DB: **PostgreSQL** (starts with shared `tenant_id` approach, designed for schema/db-per-tenant migration)
- Local development should not *require* Docker; provide first-class local workflows for Windows using PowerShell and optional online dev DB.
- CI/CD: **GitHub Actions** with code scanning (CodeQL), dependency checks (Dependabot), and PR security checklist.

---

## Goals & Constraints
- Small team: simplicity and consistency > cleverness
- Security-first: encryption (in transit + at rest), audit capability, secrets management abstraction
- Operate it as SaaS: we provision infra, but design for tenant isolation and multi-region when needed
- Start small (50 tenants expected in year 1), design for 5,000 tenants and enterprise customers

---

## Monorepo Layout (Recommended)

```
/ (repo root)
├─ package.json                     # workspace scripts
├─ pnpm-workspace.yaml
├─ turbo.json                       # task pipeline
├─ tsconfig.base.json               # shared TS config
├─ .eslintrc, .prettierrc
├─ .github/workflows/*               # CI & security jobs
├─ packages/
│  ├─ services/
│  │  ├─ api-gateway/               # edge layer: auth, rate-limits, routing
│  │  ├─ tenant-service/            # tenant lifecycle and metadata
│  │  ├─ connector-service/         # external adapters (QBO, HubSpot)
│  │  ├─ workflow-service/          # long-running orchestrations
│  │  ├─ billing-service/           # usage collection and invoicing
│  │  └─ audit-service/             # immutable audit log & retention
│  └─ libs/
│     ├─ db/                        # Prisma schema, migrations, tenant-aware adapters
│     ├─ auth/                      # RequestContext, middleware, token helpers
│     ├─ observability/             # OTEL instrumentation wrappers
│     ├─ secrets/                   # Secrets provider abstraction + dev shim
│     └─ shared/                    # shared types, error patterns, common utils
├─ docs/                            # design & architecture docs (this project)
├─ scripts/                         # small helper scripts (e.g., dev setup)
└─ infra/                           # IaC templates (Terraform modules) — gated access
```

### Package Naming Conventions
- Services: `@bridgeflow/service-${name}` (e.g., `@bridgeflow/service-tenant`) or `services/${name}` in workspace
- Libraries: `@bridgeflow/lib-${name}` (e.g., `@bridgeflow/lib-db`)

---

## Tooling & Opinions
- Package manager: **pnpm** (fast, deterministic installs)
- Runner: **Turborepo** (task-level caching; Nx is an alternative if we want monorepo-aware generators)
- ORM & migrations: **Prisma** — good DX, first-class TypeScript types, and manageable migrations for Postgres
- Testing: **Vitest** (fast) + **Supertest** for HTTP/integration assertions; **pg-mem** for unit DB tests
- Lint: **ESLint** + TypeScript recommended rules (no `any` in security code)
- CI/CD: **GitHub Actions** with separate jobs for lint/test/security scans
- Observability: **OpenTelemetry** instrumentation in libs, export to chosen APM (Datadog, Lightstep, or Prometheus + Grafana)

---

## Local Development (No Docker Required)
- Recommended dev workflow (Windows-friendly):
  - Option 1 (recommended): Use a managed dev Postgres (e.g., Supabase dev project) and connect locally via `.env.development`
  - Option 2: Install Postgres locally using the official installer or WSL and run migrations via `pnpm -w run migrate:dev`
- `pg-mem` for unit tests and CI for fast, hermetic tests
- Provide `scripts/dev-setup.ps1` to automate local db checks and migration runs for Windows users

Example dev scripts in the root `package.json`:
```json
{
  "scripts": {
    "dev": "turbo run dev --parallel",
    "build": "turbo run build",
    "test": "turbo run test",
    "migrate:dev": "pnpm -w --filter @bridgeflow/lib-db run migrate:dev"
  }
}
```

---

## CI & PR Requirements
- Required checks on PRs: lint, test (unit + fast integration), typecheck, CodeQL (security), dependency scan
- PR template must include: security checklist, change summary, migration impact (yes/no), data access review required (yes/no)
- Branch protection: require PR approvals and passing checks; limit merge rights via `CODEOWNERS` for sensitive areas

---

## Security & Compliance Hooks
- All services must use `@bridgeflow/lib-secrets` abstraction to retrieve credentials (no raw env reads in production-critical code)
- `@bridgeflow/lib-audit` for append-only audit events; ingest into `audit-service` and apply 7-year retention strategy (cold storage after 90 days)
- All logs must include `requestId`, `tenantId`, `principalId` and be structured JSON
- Production secrets stored in KMS/SecretsManager (AWS KMS + SSM/Secrets Manager or AWS Secrets Manager preferred)

---

## Migration Notes (tenant_id -> schema/db-per-tenant)
- Start: enforce tenant filters in repositories; use RequestContext to hold tenant identity
- Preparation: implement `TenantDescriptor` metadata and `TenantManager` service to handle isolation mode flags
- Migration strategy: dual-writes (write to both shared and target schema), backfill, validate checksums, and switch reads to new schema behind a feature flag
- Tooling: migration worker (idempotent), per-tenant migration status, operator dashboard

---

## Operational & Monitoring
- Health checks per service; readiness/liveness endpoints
- Centralized metrics, tracing, and logs; make tenant-aware dashboards (tenant filter)
- Backup policy: nightly backups with validation; test per-tenant restore as part of runbook for enterprise customers

---

## Next steps & Actionables
- Choose Turborepo vs Nx (I recommend Turborepo for simplicity)
- Scaffold the monorepo with minimal packages: `service-api-gateway`, `service-tenant`, `lib-db`, `lib-auth`, `lib-secrets`, `lib-observability` and add CI job stubs
- Create `PR` templates, `CODEOWNERS`, and `security-checklist` to enforce reviews

If this structure looks good, I'll scaffold a minimal repo skeleton (package.json, pnpm workspace, sample services — not production code) and add GitHub Actions CI templates. Feedback or adjustments?