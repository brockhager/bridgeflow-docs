Verification Checklist (concise)

Session timebox: 30 minutes

1) Goals & context (2 mins)
- Confirm scope: Audit UI + User Management + RBAC + Accessibility

2) Live demo (8 mins)
- Audit: apply jobId filter, apply date range, perform search, paginate, export CSV
- Users: create user, change role (admin only), disable user

3) Accessibility checks (6 mins)
- Keyboard only: tab through controls, open modal, press Escape
- Screen reader: verify live region announcements for filter/search/export/pagination

4) Security checks (6 mins)
- Non-admin cannot change roles (expect 403)
- Confirm audit logs created for user changes (search in Audit UI)

5) Wrap-up (4 mins)
- Record issues/actions and assign owners
- Confirm next steps and sign-off criteria

Success criteria (pass if all below):
- No critical accessibility failures
- RBAC prevents unauthorized changes
- Audit logs present for user changes
- UI actions announce results via live region
