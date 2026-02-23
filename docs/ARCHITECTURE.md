# BridgeFlow Architecture

## 5-Layer Design Pattern

BridgeFlow follows the CTO-defined 5-layer conceptual model (Admin BridgeFlow + 5 functional layers). The conceptual model remains the project's design target, but the live implementation (Phases 18–21) follows pragmatic patterns that prioritize security, simplicity, and operability.

### Conceptual model (for planning)
- **Layer 0 — Admin BridgeFlow**: Admin portal and internal operations UI (admin-bridgeflow/).
- **Layer 1 — Business Layer**: Domain logic, workflows, and high-level invariants (intended place for business services).
- **Layer 2 — Communication Layer**: Protocol adapters, bridge wizards, integrations (QuickBooks, partner gateways, CSV ingest).
- **Layer 3 — Data Mapping Layer**: Mapping rules and transform engines (optional until needed).
- **Layer 4 — Platform Core**: Auth, monitoring, jobs, rate limiting, security primitives.
- **Layer 5 — Infrastructure**: Persistence, Prisma, Redis, S3, deployments.

---

## Implementation reality (Phases 18–21)

**Short summary:** The current codebase implements a pragmatic, route-handler-centric architecture where **business logic lives primarily in API route handlers (`api/handlers/*`) and calls Prisma directly**, and **tenant isolation is enforced via PostgreSQL Row-Level Security (RLS)**. The `api/lib/stores/` location is historical/optional and should not be treated as the canonical place for all business logic unless the team elects to perform a stores-first refactor.

Key points:
- Business logic: `api/handlers/*` (e.g., `tradingPartners.js`, `tpProfile.js`) orchestrate validation, Prisma queries, and responses.
- Security: Tenancy is enforced by **RLS** in the DB; handlers and Prisma queries are written with RLS assumptions (see `scripts/check-rls.js`).
- Frontend stores: `web/src/stores/*` are purely UI state and should never contain DB logic.
- Communication adapters (QBO, partner gateway, CSV) live as handler modules and/or adapter files under `api/handlers/*` and `api/lib/*` as appropriate.

### Mapping (conceptual layer → implementation)
- Layer 0 (Admin): `admin-bridgeflow/`
- Layer 1 (Business): `api/handlers/*` (route handlers) — business logic lives here today
- Layer 2 (Communication): `api/handlers/bridges.js`, `handlers/qbo.js`, `handlers/partnerInbound.js`, upload handlers
- Layer 3 (Data Mapping): Minimal / not present — per-adapter normalization happens in handlers
- Layer 4 (Platform Core): `api/lib/rbac.js`, `lib/mtls.js`, `lib/rateLimiter.js`, auth handlers `handlers/auth.js` — **RLS is the primary tenancy control**
- Layer 5 (Infrastructure): `prisma/`, `api/lib/db.js`, `lib/redis.js`, `certs/`, deploy scripts

---

## Guidance / Best Practices
- Do **not** reintroduce `api/lib/stores/` as the canonical business-logic boundary without an explicit refactor plan. If the team decides to move to a stores/services model, follow a dedicated migration plan and update docs accordingly.
- Prefer small, well-tested service modules (e.g., `api/services/*`) for complex logic extracted from handlers. Keep route handlers thin (validate, auth, call service, return response).
- Continue to rely on RLS for tenancy; add a small suite of RLS smoke tests (see `scripts/check-rls.js`) that ensure policies behave as expected.
- Only add a shared mapping engine if multiple adapters require runtime mapping; otherwise keep adapter-specific normalization local to those handlers.
- Add a short “Refactor Checklist” when extracting logic to services (tests, RLS-awareness, idempotency, metrics).

---

## Store Separation Rule (updated)
1. **Frontend stores** (`web/src/stores/*`) MUST only handle UI state and API interactions.
2. **Backend data/service modules** (preferred) should live under `api/services/*` or remain as small, well-documented helper modules when appropriate.
3. The legacy `api/lib/stores/*` path is **deprecated** as the canonical source of truth; treat existing modules there as historical and migrate them when extracting service boundaries.

(If your change touches tenancy or data access, add an RLS smoke test and link it to `scripts/check-rls.js`.)
