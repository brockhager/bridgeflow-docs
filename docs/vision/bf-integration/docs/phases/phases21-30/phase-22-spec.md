> [!WARNING]
> Status: Planned / In Development
> Context: Original BF-INTEGRATION Vision (Pre-Phase 30)
# Phase 22: Trading Partner Registration System

## Goal
Allow external trading partners to self‑register, enter a pending queue for admin approval, and upon approval become limited‑access partners capable of sending/receiving documents, with a clear upgrade path to become full BridgeFlow customers.

---

## Issue 22A: Public Partner Registration Portal
**Assignee:** Agent4  
**Labels:** phase:22, frontend, auth, registration

### Deliverables
1. **Public sign‑up route** `/partner‑signup`
   - Standalone page, no login required
   - Form: Partner name, admin email, password, contact info
2. **Backend registration endpoint** `POST /api/auth/register-partner`
   - Creates:
     - `Organization` with `type = 'partner'`
     - `User` with `role = 'partner'`
     - `PartnerRegistration` record with `status = 'pending'`
   - Email verification required before activation
3. **Confirmation page** after sign‑up
   - “Thank you for registering. Your account is pending approval.”
   - Links to support/docs

### Guardrails
- One partner per registration
- Email must be unique across system
- No automatic activation — admin must approve
- Reuse existing auth flow (JWT, verification emails)

---

## Issue 22B: Admin Approval Queue & Feature Gating
**Assignee:** Agent4  
**Labels:** phase:22, backend, admin

### Deliverables
1. **Admin queue UI** `/admin/partner‑queue`
   - Lists pending registrations (name, email, submitted date)
   - Actions: Approve / Deny (with reason)
2. **Approval workflow**
   - Approve → creates `TradingPartner` record linked to inviting SMB’s org (TBD later)
   - Sets `accessLevel = 'limited'` on partner’s organization
   - Sends approval email to partner
3. **Feature gating**
   - `accessLevel = 'limited'`: can only send/receive via existing bridges, no canvas, no bridge creation
   - `accessLevel = 'full'`: full customer access (future upgrade)
4. **Notifications**
   - Email to partner when approved/denied
   - In‑app alert to SMB customer when invited partner is approved

### Guardrails
- RBAC not used — RLS isolates partner data
- Pending registrations are visible only to admins
- Denied registrations are logged but soft‑deleted

---

## Issue 22C: Partner Onboarding & Conversion Path
**Assignee:** Agent4  
**Labels:** phase:22, frontend, onboarding

### Deliverables
1. **Post‑approval onboarding wizard** `/partner/onboarding`
   - Steps:
     1. Confirm contact/details
     2. Set up first connection (CSV or QBO)
     3. Generate first API key
     4. View limited dashboard
2. **Limited partner dashboard**
   - Inbox/outbox (documents sent/received)
   - API key management
   - No canvas, no bridge configuration
3. **Upgrade path**
   - “Upgrade to full account” button (placeholder for future billing)
   - If upgraded, `accessLevel = 'full'` and partner becomes full customer with canvas access

### Guardrails
- Onboarding skippable (partner can exit and return)
- Dashboard only shows data scoped to partner’s own org (RLS)
- Upgrade button is non‑functional in Phase 22 — logs event for future phase

---

## Data Model Additions
```prisma
model PartnerRegistration {
  id          String   @id @default(cuid())
  email       String   @unique
  partnerName String
  contactInfo Json?    // { phone, address }
  status      String   // 'pending', 'approved', 'denied'
  submittedAt DateTime @default(now())
  reviewedAt  DateTime?
  reviewedBy  String?  // admin user ID
  notes       String?
}

// Add to Organization model:
// type        String  @default('customer') // 'customer', 'partner'
// accessLevel String  @default('full')     // 'full', 'limited'
```

**Dependencies**
Existing auth system (/api/auth/register)

RLS policies (already in place)

Email service (already used for verification)

**Timeline**
2‑week sprint

**Order:** 22A → 22B → 22C

**All work direct to main after local test pass (USE_MOCK_DB=true)**

**Out of Scope**
Payment/plan selection

Bulk partner import

Partner‑to‑partner networking

Custom roles or permissions beyond accessLevel


**Once you or Agent4 creates the file, I will instruct the team to begin.**

---

## Implementation constraints & Agent10 directives (must follow)

1. **Security model: RLS is the sole gatekeeper**
   - Do NOT use `role = 'partner'` or `accessLevel` in application logic to gate data access.
   - All data queries (documents, connections, API keys) must rely on PostgreSQL RLS policies that use `organization.type` and `organization.id` from the JWT context.
   - `accessLevel` is UI-only (e.g., hide/disable “Upgrade” button) and **must never** be used for backend data isolation.

2. **Auth flow: extend existing registration**
   - Do not add a separate registration endpoint.
   - Extend `/api/auth/register` to accept `type='partner'` (query param or request body) and reuse the existing email uniqueness, password hashing, and verification email flow.
   - Skip SMB profile creation for partners; link the created User to a new `Organization { type: 'partner', accessLevel: 'limited' }` on approval.

3. **PartnerRegistration lifecycle**
   - On approve: create the `Organization` (type = 'partner', accessLevel = 'limited'), link the `User` to this org, and **archive/delete** the `PartnerRegistration` record to avoid duplication.
   - On deny: soft-delete `PartnerRegistration` and record denial reason/notes.

4. **RLS policy guidance (for Agent10/DB)**
   - Documents, API keys, and connections must be scoped by `current_setting('app.current_org_id')` and include `organization.type = 'partner'` where relevant (see implementation notes below).
   - Do not hard-code RLS in application logic; add SQL `CREATE POLICY` statements in migrations or DB init scripts.

5. **Go/No-Go**
   - Agent4 may proceed when they confirm they will:
     - Reuse `/api/auth/register` (type='partner')
     - Not use `accessLevel`/`role` in backend queries
     - Add RLS-aware smoke tests and migration for required policies

---

**Agent10 note:** I will add the specific SQL policy snippets and a short migration plan for `organization.type = 'partner'` to accompany the phase work. Proceed when Agent4 confirms understanding.

—  
Agent2

