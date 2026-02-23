> [!WARNING]
> Status: Planned / In Development
> Context: Original BF-INTEGRATION Vision (Pre-Phase 30)
# Layer 4 — Platform Core (Overview)

**Status:** ✅ Phase 17 Complete — Foundation (RBAC, Test Hardening, Admin Tests)
**Last Updated:** Dec 29, 2025

**Phase 17 Summary:** Phase 17 completed the RBAC foundation, hardened tests (migrated brittle DB-heavy admin tests into fast handler-level unit tests), added mock DB safety, and improved test harness stability. All verification checks passed and the CTO signed off on Dec 29, 2025.

**Phase 18 Kickoff (Customer API Platform):** Phase 18 begins: customer API keys, `/ingest` router, per-customer rate limiting (Redis), metrics instrumentation, and CI-gated E2E tests. See `docs/issues/phase-18-*` for initial issue drafts and the project board for assigned owners.

This folder collects documentation for Layer 4 (Platform Core): the security, administrative, and customer-facing foundation for the BridgeFlow commercial SaaS platform (RBAC, audit, user management, authentication, billing, multi-tenancy).

Contents:
- `Security-Foundation.md` — design and implementation notes for RBAC, authentication, audit
- `Admin-Interfaces.md` — UI design and usage for Audit and User Management pages
- `Accessibility-Spec.md` — accessibility decisions (ARIA, focus, live region)
- `API-Endpoints.md` — Layer 4 API reference (endpoints, query params, permissions)
- `Verification-Checklist.md` — CTO verification script, agenda, success criteria
- `Deployment-Guide.md` — environment flags and rollout guidance
- `screenshots/` — screenshots and small assets for demos

Phase 33 (Firewall Security) — New Docs
- See Phase 31-40 overview: [../phases/phases31-40/README.md](../phases/phases31-40/README.md)
- Firewall API spec: [../phases/phases31-40/phase-33-firewall-api.md](../phases/phases31-40/phase-33-firewall-api.md)
- Canvas integration guide: [../phases/phases31-40/phase-33-firewall-canvas-integration.md](../phases/phases31-40/phase-33-firewall-canvas-integration.md)
- Complete summary: [../phases/phases31-40/PHASE-33-COMPLETE-SUMMARY.md](../phases/phases31-40/PHASE-33-COMPLETE-SUMMARY.md)
- Quick start: [../phases/phases31-40/README-PHASE-33.md](../phases/phases31-40/README-PHASE-33.md)

## Phase 39 — Super-Admin & Canvas Authentication
Phase 39 included critical authentication and authorization fixes relevant to Layer 4 responsibilities:

- Added `SUPER_ADMINS` environment variable (email list) to grant system-wide admin privileges to trusted operators (e.g., CTO). See: `docs/deployment/SUPER_ADMINS.md`.
- Login JWTs now include `isSuperAdmin: true` when matching `SUPER_ADMINS`, enabling global operations such as creating public blueprints (`organizationId: null`). See: `api/handlers/auth.js` and `test/integration/super-admin-create-blueprint.test.js`.
- Impact: Allows safe, auditable system-level administration while preserving tenant isolation and RBAC.

(Also see overall Phase summary: `docs/phases/phases31-40/PHASE-39-COMPLETE-SUMMARY.md`)

**Phase 11 Additions (Customer Core):**
- Authentication system: JWT-based auth, session management, password hashing
- Organization/Tenancy: Multi-tenant architecture, membership roles, tenant isolation
- Billing Integration: Stripe checkout, plan management, subscription lifecycle
- Webhook processing: Automated subscription activation
- API Endpoints: `/api/auth/*`, `/api/organizations/*`, `/api/billing/*`, `/api/webhooks/stripe`
- Test Coverage: `api/tests/auth.test.js`, `api/tests/billing.test.js`

How to use
1. Read `README.md` and `Security-Foundation.md` for context.
2. Run through the `Verification-Checklist.md` to validate readiness with the CTO (Phase 17 completed).
3. Refer to `API-Endpoints.md` when integrating or testing APIs.
4. For Phase 18: check `docs/issues/phase-18-*` and the project board for kickoff tasks and PRs.

Notes
- The canonical security design is also referenced at `docs/design/layer4-platform-core-security.md` (legacy design doc) and has been migrated and summarized into these documents.

