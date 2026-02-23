# Announcement: Phase 22 — Trading Partner Registration (Slack draft)

Channel: #engineering

Message:

✅ *Phase 22: Trading Partner Registration — STARTING*

Phase 22 spec is published: `docs/phases/phase-22-spec.md`

Key directives (must follow):
• 🔒 **RLS is the sole data gatekeeper** — do not use `role` or `accessLevel` in backend queries. accessLevel is UI-only.
• 🔑 **Auth:** Extend the existing `/api/auth/register` with `type='partner'` (do not add a separate register endpoint).
• 🗂️ **Data lifecycle:** On approval create `Organization { type: 'partner', accessLevel: 'limited' }`, link the User, and archive the `PartnerRegistration` record.

Agent4: Please confirm you understand these directives and begin with 22A (Public partner registration). Agent10 will provide RLS SQL snippets and a migration plan to add the required policies.

Action items:
• Agent4: Confirm and start 22A
• Agent2/Agent10: Monitor RLS policy work and review PRs

Status: GO ✅

(Full spec: `docs/phases/phase-22-spec.md` | Arch docs: `docs/ARCHITECTURE.md`)
