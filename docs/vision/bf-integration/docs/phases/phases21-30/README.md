> [!WARNING]
> Status: Planned / In Development
> Context: Original BF-INTEGRATION Vision (Pre-Phase 30)
# Phases 21-30 — Advanced Features & Unified Experience

This folder contains documentation for Phases 21-30, focusing on advanced trading partner features, sophisticated B2B workflows, and unified command center capabilities.

---

## Phase Overview

### Phase 21 — TBD
**Status:** Not yet documented

**Note:** No documentation found for Phase 21 in this folder. Check commit history or related RFCs for details.

---

### Phase 22 — Trading Partner Registration System ✅
**Completed:** December 30, 2025

**What We Built:**
- **22A (Public Partner Registration):** Self-service signup at `/partner-signup` (no login required)
  - Form: Partner name, admin email, password, contact info
  - Backend: `POST /api/auth/register-partner` creates Organization + User + PartnerRegistration (pending status)
  - Email verification required before activation
  - Confirmation page: "Thank you for registering. Your account is pending approval."

- **22B (Admin Approval Queue):** Admin-facing approval workflow
  - Admin queue UI at `/admin/partner-queue` lists pending registrations
  - Endpoints: GET pending registrations, POST approve/deny
  - Approve flow: Creates TradingPartner, sets `accessLevel='limited'`, sends approval email
  - Feature gating: Limited partners can only send/receive, no Canvas or bridge creation
  - RLS-first security: DB-level tenant isolation, not role-based

- **22C (Onboarding Wizard):** Scoped for follow-up (not implemented)
  - Would include: `/partner/onboarding` flow, limited partner dashboard, API key generation
  - Upgrade path to full customer account

**System Impact:**
Enabled external trading partners to self-register and be approved into a limited-access partner organization. Established RLS-first security model where data isolation is enforced at database level, not application layer. Created clear separation between limited partners (send/receive only) and full customers (Canvas access).

**Key Documents:**
- [Phase 22 Specification](phase-22-spec.md) — Complete feature spec with three issues
- [Phase 22 Completion Summary](phase-22-completion-summary.md) — Implementation details and verification steps
- [Phase 22 Issue](phase-22-issue.md) — Issue tracking

**Files Delivered:**
- Frontend: `web/partner-signup.html`, `web/src/partner-signup.js`, router entry
- Backend: `api/handlers/auth.js` (registration), `api/handlers/partnerRegistrations.js` (approve/deny)
- Database: `PartnerRegistration` model, `Organization.type` and `Organization.accessLevel` fields
- Tests: `test/integration/partner-registration.test.js`, `test/integration/partner-approval.test.js`, `test/integration/partner-rls.test.js`

**Test Coverage:** ✅ Registration → verification, admin approve → org creation, RLS scoping, access control

**Security Model:** RLS-first (backend doesn't rely on role/accessLevel for gating; Postgres RLS enforces tenant isolation)

**How to Run:**
```bash
pnpm exec vitest run test/integration/partner-registration.test.js
pnpm exec vitest run test/integration/partner-approval.test.js
# Manual: Start API, visit /partner-signup, verify email, approve in admin UI
```

**Outstanding:** Phase 22C (onboarding wizard) deferred to follow-up phase

---

### Phase 23 — TBD
**Status:** Not yet documented

**Note:** No documentation found for Phase 23. May have been skipped or merged into adjacent phases.

---

### Phase 24 — TBD
**Status:** Not yet documented

**Note:** No documentation found for Phase 24. Check project board or issues for context.

---

### Phase 25 — PO-to-Acknowledgment Cycle ✅
**Completed:** 2025 (Production Ready)

**What We Built:**
- **Document Ingestion:** `POST /api/documents` accepts raw EDI 210 (text/plain or JSON)
  - Validates basic syntax
  - Stores payload with `status = RECEIVED`

- **Real EDI Parsing:** Uses `x12-parser` to parse EDI 210
  - Extracts: shipmentId (BSN), weight & weightUnit (L5), sender, receiver
  - Returns structured JSON for downstream processing

- **Mapping Engine:** Organization-specific mapping rules
  - Transforms parsed 210 → canonical internal format (e.g., `{ externalId, totalWeight, weightUnit, sender }`)
  - Stores result in `Document.canonicalContent`

- **Acknowledgment Generation:** `generate997.js` creates EDI 997 acknowledgment
  - Swaps sender/receiver in ISA/GS for ACK
  - Uses original control numbers
  - Sets `AK5*A` (accepted) for success case
  - Stores generated 997 in `Document.ackContent`, updates `status = ACK_GENERATED`

- **ACK Access:** `GET /api/documents/:id/ack` returns plain-text 997 (Content-Type: text/plain)

**System Impact:**
Established complete PO-to-Acknowledgment workflow for EDI 210 documents. Core capability for B2B supply chain integration. Mapping engine creates flexibility for organization-specific transformations. Ready for pilot deployments.

**Key Documents:**
- [Phase 25 Completion](phase25-complete.md) — Full scope, verification checklist, technical details

**Data Model:**
```
Document:
  - content (raw EDI payload)
  - canonicalContent (mapped JSON)
  - ackContent (generated 997 EDI)
  - status (RECEIVED → PARSING → PROCESSED → ACK_GENERATED)
  - organizationId (RBAC)
```

**Test Coverage:** ✅ Unit tests (parser, mapper, generator), E2E tests (ingestion → mapping → ACK generation)

**Demo:** `start/start-ctodemo.ps1` demonstrates flow: sends sample 210, fetches generated 997

**Not Included (Phase 26+):**
- Job queues and async background workers
- Email/SMS alerts and external notifications
- `/alerts` dashboard and live monitoring UI
- Retry logic and retry policies
- Additional transaction sets (850, 810, etc.)

---

### Phase 26 — TBD
**Status:** Not yet documented

**Note:** No documentation found for Phase 26. May cover monitoring, alerts, or additional transaction types.

---

### Phase 27 — Enterprise Workflow Unification ✅
**Completed:** January 2, 2026  
**Status:** Production Ready (80% Core Deliverables)

**What We Built:**

**Core Deliverables (8/10):**
1. **Phase 27 Documentation** — Comprehensive spec with objectives, user flows, architecture
2. **Database Schema Updates** — `Document.partnerId`, `TradingPartner.status`, migration applied
3. **Homepage Dashboard Backend** — `GET /api/dashboard/health`, `/api/dashboard/quick-stats`
   - Health calculation (healthy/warning/critical based on stuck/failed docs)
   - Uptime metrics, recent activity, action items
4. **Homepage Dashboard Frontend** — Health widget in main menu
   - Badge (✅⚠️❌), metrics, quick links to alerts/Canvas/create-TP
5. **Canvas TP Status Indicators Backend** — `GET /api/trading-partners/:id/doc-status`, `/api/trading-partners/statuses`
   - Individual and bulk partner health endpoints
6. **Canvas TP Status Indicators Frontend** — Status dots on TP nodes
   - ✅ (healthy) / ⚠️ (warning) / ➖ (no docs)
   - Click warning → navigate to alerts filtered by partner
7. **Ingest Auto-Linking** — ISA sender ID extraction
   - Automatically populate `partnerId` on document creation
8. **End-to-End Integration Test** — Comprehensive E2E validation
   - 2 tests: Full unified flow + partner auto-linking
   - ✅ All passing (2/2)

**Intentionally Deferred (2/10):**
- Activity stream backend API (new models required, Phase 28 candidate)
- Activity stream frontend route (depends on backend, Phase 28 candidate)

**System Impact:**
Transformed BridgeFlow from "5 tools that share a database" → unified B2B command center. Users experience seamless workflows: login → see health warning → navigate to Canvas → investigate partner → retry failed documents → watch ACK generation → see health recover. Homepage + Canvas = 80% of user touchpoints, delivering full unified value.

**Key Documents:**
- [Phase 27 Unified Experience Spec](phase27-unified-experience.md) — Complete specification
- [Phase 27 Completion Report](phase27-completion-report.md) — Full implementation report (production-ready)

**Core Features:**

*Homepage Dashboard:*
- Health badge + activity metrics + action items
- "All systems normal" or "Action needed" status
- Links to /alerts, /canvas, /create-tp

*Canvas Integration:*
- Real-time partner health indicators
- Status dots with hover tooltips
- One-click navigation to alerts for investigation

*Partner-Centric Health Tracking:*
- Document.partnerId links docs to partners
- Health calculated per partner (healthy/warning/critical)
- Stuck document detection (RECEIVED status, >2min old)

*Auto-Linking:*
- ISA segment parser extracts sender ID
- Automatic TradingPartner lookup
- Populates Document.partnerId on ingest

**Technical Implementation:**
- Backend handlers: `api/handlers/dashboard.js`, `api/handlers/trading-partners.js`
- Frontend routes: `web/src/routes/main-menu.js`, `web/src/assembly.js`
- CSS: `web/css/assembly.css` (status indicators, pulse animation)
- E2E test: `api/tests/integration/phase27-unified-flow.test.js`

**Critical Fixes Applied:**
- Fixed missing `await getPrisma()` calls (was causing 500 errors)
- Fixed MockDB `createdAt` preservation (tests couldn't simulate stuck docs)
- Added MockDB `select` and `take` support (Prisma parity)

**Test Results:** ✅ All passing (2/2 E2E tests)
```
✓ validates full unified experience flow
✓ validates partner auto-linking from ISA sender ID
Duration: 1.85s (tests 300ms)
```

**Production Readiness:** ✅ All core touchpoints functional, E2E validated, RBAC enforced, error handling in place

**Demo Ready:** 90-second script (login → alert → Canvas → retry → success)

**Next Steps (User Direction: "Stop building. Start validating."):**
1. Record 90-second demo for pilot prospects
2. Validate with 5 pilot customers (send real 210 → see ACK + health)
3. Charge early access ($500/mo first 3 customers)

---

### Phase 28 — Partner Onboarding Workflow ✅
**Completed:** January 3, 2026

**What We Built:**
Complete end-to-end partner onboarding workflow connecting automated partner discovery with manual profile completion. Enables seamless transition from `PENDING_ONBOARDING` partners to `ACTIVE` trading partners.

**Core Features:**
- **Pending Partners UI:** Separate section showing partners requiring profile completion
- **Profile Completion Flow:** Pre-filled forms for completing partner profiles
- **Status Promotion:** Automatic `PENDING_ONBOARDING` → `ACTIVE` transition
- **Success Feedback:** User confirmation banners and navigation
- **Safe Error Handling:** Crash-prevention patterns for API failures

**System Impact:**
Bridges automated partner discovery (ingest) with manual onboarding (UI). Eliminates admin intervention in profile completion. Establishes pattern for other onboarding workflows.

**Key Documents:**
- [Phase 28 Implementation](phase-28.md) — Complete specification and implementation details

**Files Delivered:**
- Frontend: `web/src/routes/trading-partners.js`, `web/src/routes/trading-partners-create.js`
- State: `web/src/state/store.js`
- Tests: `test/integration/partner-onboarding-e2e.test.js`

**Test Coverage:** ✅ E2E workflow validation, error handling, UI integration

**Demo:** Visit `/trading-partners` to see pending partners, click "Complete Profile" to test workflow

---

### Phase 30 — Layer 2 Core Entities ✅
**Completed:** January 8, 2026  
**Effort:** 2-3 hours  
**Priority:** High (protocol integration foundation)

**What We Built:**
Complete Layer 2 Core Entities implementation providing critical scaffolding for real protocol integration. Establishes Connectors and Endpoints as the foundation for AS2, SFTP, API, and EMAIL protocols while maintaining proper multi-tenant architecture and admin management capabilities.

**Core Deliverables (4/4):**
1. **Prisma Schema**: Connector, Endpoint, and Tenet models with proper relations
2. **Admin API Endpoints**: Full CRUD with organization scoping and security
3. **Admin UI Foundations**: Professional connector management interface
4. **Protocol Handler Stubs**: AS2, SFTP, API, EMAIL protocol foundations

**System Impact:**
Establishes the Layer 2 foundation for protocol integration. Connectors represent protocol-specific communication channels owned by organizations, while Endpoints define directional data flow with optional tenet binding. This architecture enables real protocol integration while maintaining security, scalability, and professional admin experience.

**Key Documents:**
- [Phase 30 Implementation](phase-30.md) — Complete specification and implementation details

**Files Delivered:**
- Database: `prisma/schema.prisma` - Added Connector, Endpoint, Tenet models
- Backend: `api/handlers/admin/connectors.js`, `api/handlers/admin/endpoints.js`
- API Routes: `api/routes/adminConnectors.js`, `api/routes/adminEndpoints.js`
- Frontend: `admin-bridgeflow/src/pages/Connectors.jsx`
- Protocol Stubs: `api/handlers/protocols/as2.js`, `api/handlers/protocols/sftp.js`, `api/handlers/protocols/api.js`

**Test Coverage:** ✅ API endpoints, validation, UI components, protocol handler stubs

**Demo:** 
1. Run `pwsh -File start/start-admin.ps1`
2. Login to `http://localhost:3001/admin` (cto@bridgeflow.test / BridgeFlow123!)
3. Click "📦 Connectors" to manage protocol connectors
4. Create AS2, SFTP, API, or EMAIL connectors with dynamic forms

**Real-World Workflow:**
```
Org: BridgeFlow Group
├── Connector: SFTP - Inbound Claims (type: SFTP)
│   └── Endpoint: Inbound 837 (direction: INGRESS, tenetId: hipaa-claims-tenet)
│       ↓
│       When file lands in SFTP folder → System creates Package
│       ↓
│       Package attributes:
│       - organizationId = BridgeFlow Group
│       - tenetId = hipaa-claims-tenet  
│       - endpointId = endpoint.id
│       - Enters Phase 28 processing
```

---

### Phase 29 — Organizations & Tenets ✅ COMPLETE
**Status:** COMPLETE AND VALIDATED

**System Impact:**
Establishes the core organizational model and tenet enforcement that underpins the entire BridgeFlow platform. Implements multi-tenant architecture with proper data isolation, security, and scalability. Provides CTO with full admin access to all organizations and tenets.

**Key Documents:**
- [Phase 29 Implementation](phase-29-organizations-tenets.md) — Complete specification, implementation details, and CTO access guide

**Files Delivered:**
- Backend: `api/handlers/auth.js`, `api/lib/seedDevData.js`, `api/migrations/phase29-migration.js`
- Frontend: `admin-bridgeflow/src/pages/TenetProfiles.jsx`, `admin-bridgeflow/src/pages/TenetDetail.jsx`
- API: `api/handlers/tenetProfiles.js`, `api/routes/tenetProfiles.js`
- Tests: `test-phase29.js`, `test-login-cto.js`

**Test Coverage:** ✅ 5/5 tests passing - Regular users, bf_employees, cross-org isolation, CTO admin access, TenetProfiles access

**Demo:** 
1. Run `pwsh -File start/start-admin.ps1`
2. Login to `http://localhost:3001/admin` (cto@bridgeflow.test / BridgeFlow123!)
3. Click "🏢 Tenets" to view and manage all organizations

**Critical Fix:** Resolved CTO `isBfEmployee` flag issue that was preventing admin tenet access

---

## Phase Progression Summary

**Phase 21:** TBD  
**Phase 22:** Trading Partner registration + approval workflow (RLS-first security)  
**Phase 23-24:** TBD  
**Phase 25:** PO-to-Acknowledgment EDI 210 workflow (parsing, mapping, 997 generation)  
**Phase 26:** TBD  
**Phase 27:** Unified B2B command center (homepage + Canvas integration)  
**Phase 28:** Partner onboarding workflow (PENDING_ONBOARDING → ACTIVE)  
**Phase 29:** Organizations & Tenets (multi-tenant architecture + CTO admin access) ✅  
**Phase 30:** Layer 2 Core Entities (Connectors & Endpoints for protocol integration) ✅  
**Phase 31+:** Real protocol implementation (AS2, SFTP, API, EMAIL)

---

## Common Patterns Established

### Partner Lifecycle
- Self-registration → email verification → admin approval → limited access
- RLS-enforced tenant isolation (no role-based gating)
- Clear upgrade path to full customer account
- **Automated Discovery → Manual Onboarding:** Ingest creates PENDING_ONBOARDING partners → UI enables profile completion → ACTIVE status

### B2B Document Processing
- Ingest → parse (structured JSON) → map (organization-specific) → transform → acknowledge
- EDI 210 (PO) → mapping → EDI 997 (ACK) cycle
- Partner-centric document tracking (partnerId links docs to partners)

### Unified User Experience
- Homepage dashboard provides situational awareness on login
- Canvas shows real-time partner health indicators
- One-click navigation from alerts → investigation → retry → resolution
- Seamless flow: problem detection → partner identification → action → recovery

### Error Handling Patterns
- Error-as-values pattern prevents frontend crashes
- Graceful degradation maintains user experience
- API failures return structured error objects, not exceptions
- UI components handle errors with appropriate user feedback

---

## Related Documentation

**Phases 1-10:** Foundation architecture, webhook integration, EDI, Bridge Builder  
**Phases 11-20:** Customer core, enterprise features, admin console, API platform  
**Phases 21-30:** Advanced partner features, unified experience  
**Phase 31+:** To be documented in future phase folders

**Additional Resources:**
- Architecture: `docs/ARCHITECTURE.md`
- Security: `docs/security/mtls-guide.md`, RLS policies
- EDI: `docs/edi/`, example files, technical debt
- Integration: `docs/integrations/`, partner inbound, CSV, QBO

---

**Document Index:** This README provides high-level summaries. Refer to individual phase documents for detailed specifications, acceptance criteria, and implementation notes.

Visit [phase27-completion-report.md](phase27-completion-report.md) for comprehensive production-readiness assessment.

