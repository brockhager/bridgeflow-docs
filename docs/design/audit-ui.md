# Audit UI Design

Goal: Provide an admin interface to view, filter, search, and export audit logs produced by the API.

Requirements
- Authentication: only users with `audit:read` permission (operator role) can view.
- Querying: support query params -> `jobId`, `level`, `limit`, `offset`, `search`, `dateFrom`, `dateTo`, `actionType`, `actorId`, `targetId` (optional `q` remains supported client-side)
- Pagination: simple `limit` and `offset` controls
- Filtering: `level` dropdown (info, warn, error), jobId text input
- Search: free-text search on `message` and `meta` fields (client-side fallback, server-side preferred in future)
- Export: CSV export for current query (client-side CSV of returned rows or server-side endpoint for large data)
- UX: table with columns: time, level, jobId, message, meta (collapsed JSON), actions (view JSON)
- Acceptance Criteria: operator can view, filter, and export; unauthorized user receives permission message (403)

Implementation notes
- Reuse `apiFetch` client to call `GET /api/audit` (already protected on server)
- Implement lightweight client-side search if API doesn't support `q` param
- Add `web/admin/audit.html` and `web/src/admin/audit.js` with minimal CSS
- Add navigation item under Admin; show only when stored `user.role === 'operator'` or `api/me` returns role operator

Security
- Audit access strictly requires `audit:read` permission (server enforces this)
- Limit CSV exports to small page sizes to prevent data exfiltration

Future improvements
- Server-side search & date-range filtering
- Export signing + async export job for large result sets
- Audit UI integration with monitoring/alerting dashboard

File additions
- `docs/design/audit-ui.md` (this file)
- `web/admin/audit.html`
- `web/src/admin/audit.js`
- Navigation: `web/src/navigation.config.js` update
- Tests: `web/tests/admin.audit.test.js` (to be added)
