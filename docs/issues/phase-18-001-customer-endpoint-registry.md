# [Phase 18] Customer API Endpoint Registry

**Summary:** Implement an API that allows customers to register and manage their external endpoints (so BridgeFlow can push data/ingest from customer endpoints).

Scope
- POST /api/customer/endpoints — register an endpoint (schema, auth configuration, metadata)
- GET /api/customer/endpoints — list registered endpoints for a customer

Acceptance criteria
- Endpoint registration stores: owner org, slug, name, schema (JSON Schema), auth type (API key / none / custom), metadata
- List view paginates and supports filtering by slug and name
- Proper RBAC: only organization owners or users with `customer:endpoints:write`/`customer:endpoints:read` can manage/view
- Unit tests for handler logic (mock Prisma, mock auth), minimal integration test in `test/integration/` for E2E

Owners: Agent4 (implementation), Solution Architect (spec review)

Notes
- Store schema in `customer_endpoints` table (Prisma model draft in schema PR)
- Consider validation using JSON Schema (ajv) for registered endpoint schemas
