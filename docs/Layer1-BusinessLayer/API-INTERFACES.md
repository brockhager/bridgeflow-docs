# Key API Interfaces (Layer 1)

This document lists the most commonly used endpoints and contracts managed by Layer 1. It is intentionally concise — use this as a quick reference.

- POST /api/mappings
  - Create a mapping (auth required, permissions: `mappings:create`)
  - Payload: mapping definition, samples
  - Returns: mapping id and metadata

- GET /api/mappings
  - List mappings (supports pagination and filters)

- POST /api/mappings/:id/versions
  - Create a version for a mapping

- POST /api/templates
  - Create mapping templates

- POST /api/backup/export
  - Export tenant data (mappings, templates, rules)

- POST /api/backup/import
  - Import tenant data (support conflict resolution modes)

- POST /api/jobs
  - Enqueue background jobs (type + payload)

- POST /api/worker/run
  - Endpoint used by worker runner in tests to trigger job processing

- POST /api/webhooks/stripe
  - Stripe handler (special body limit and verification)

- /api/trading-partners
  - GET /api/trading-partners — list trading partners for current org
  - POST /api/trading-partners — create a trading partner (permissions: `bridges:write` or org owner)
  - GET /api/trading-partners/:id — get trading partner details
  - PUT /api/trading-partners/:id — update trading partner
  - DELETE /api/trading-partners/:id — delete trading partner
  - POST /api/trading-partners/migrate — migrate local browser trading partners to server
    - Payload: { tradingPartners: [ { id, name, type, status, bridgeIds?, ... } ] }
    - Response: { results: [ { localId, success, serverId?, reason? } ] }

- /api/auth/*
  - Registration, login, tokens, MFA flows

- /api/secrets*
  - Secret management endpoints (RBAC protected)

Notes
- Many endpoints require RBAC checks and are gated by feature flags. See `api/lib/rbac.js` and server rollouts in `api/server.js`.
- For integration contracts and example payloads, inspect request/response fixtures under `test/` and `api/tests/`.

TODO
- Add formal OpenAPI/Swagger spec for Layer 1 endpoints (acceptance criteria and examples).
- Add sample cURL & client usage snippets for the top 10 endpoints.
