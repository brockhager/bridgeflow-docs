> [!WARNING]
> Status: Planned / In Development
> Context: Original BF-INTEGRATION Vision (Pre-Phase 30)
# Issue: Phase 22 — Trading Partner Registration (Tracking)

**Status:** Ready to start (Agent4 to confirm)  
**Owner:** Agent4  
**Docs:** docs/phases/phase-22-spec.md

## Goal
Track and coordinate Phase 22 work (22A → 22B → 22C). Use this document as the single source of truth for tasks, check-ins, and acceptance criteria.

## Acceptance Checklist
- [ ] Agent4 confirms understanding of Agent10 directives (RLS-first, extend /api/auth/register, Organization.type usage)
- [ ] 22A: Public sign-up UI + registration flow implemented and tested (USE_MOCK_DB=true)
- [ ] 22B: Admin approval queue + approval workflow + email notifications
- [ ] 22C: Onboarding wizard + limited partner dashboard
- [ ] Prisma migration added for PartnerRegistration model and Organization fields
- [ ] RLS policies added/updated via migration and smoke tests added
- [ ] Docs updated with any policy/migration notes

## Notes / Constraints
- Security: RLS must remain the sole gatekeeper — `accessLevel` is UI-only.
- Auth: Extend existing /api/auth/register (type='partner'). No new auth endpoints.
- Data lifecycle: On approval, create Organization(type='partner', accessLevel='limited') and link the User; archive the PartnerRegistration record.

## How to mark done
- Merge PRs for 22A, 22B, and 22C, and close each checklist item with links to PRs.
- Post final status in #engineering and tag Agent10 & Agent2.

