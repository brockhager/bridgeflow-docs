# Profile Layer

## Connection Profile
- **Endpoint**: `GET /api/connection/:id/profile`
- **UI Route**: `/connection/:id/profile`
- **Supported Types**:
  - `quickbooks`: Shows QBO company name
  - `partner_gateway`: Shows delivery method
  - `csv_mailbox`: Static summary (no config)

Notes:
- The UI is intentionally read-only in MVP: the **Edit** button redirects to the Phase 19 "Connect" flow (`/connect-partner`).
- The **Go to Logs** button is a disabled placeholder, per guardrails — logs are not exposed from this screen.
- No new connection types are introduced in Phase 21B; work is limited to displaying existing connection metadata.
