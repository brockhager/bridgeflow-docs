# Admin UI (Partner Management & Connection Profile)

Partner Management (Admin)
- Page: `/partners` (Admin app)
- Functionality: create partner (returns raw API key shown once), list partners, revoke keys.
- Security: requires admin privileges and `admin:partners:manage` permission.
- UX note: When creating a partner, the API key is shown once in a dismissible banner and cannot be retrieved later. Store it securely.

Connection Profile (Customer Admin / Tenant)
- Page: `/connection/:id/profile` (MVP)
- Shows: connection type badge, name, status, last edited, and a configuration summary per type.
  - QuickBooks: company name (from decrypted integration credentials)
  - Partner Gateway: Delivery Method, Partner ID
  - CSV Mailbox: summary string and uploads count (mock S3 only)
- Buttons:
  - Edit → redirects to `/connect-partner` (placeholder for Phase 19 wizard)
  - Go to Logs → intentionally disabled (guardrail)

Accessibility & UX:
- MVP focuses on clarity and correctness, not extensive styling.
- Avoid exposing sensitive tokens in UI; only show non-sensitive summary data or decrypted realm ids when necessary for display.

Developer notes:
- The page fetches `/api/connection/:id/profile` (cookie-based auth) and renders fields based on `type` and `credentials`/`metadata`.
- For additional connection types, add conditional rendering to the component and ensure RLS checks are handled on the backend.