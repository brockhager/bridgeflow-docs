# [Phase 18] Ingestion Router

**Summary:** Implement an ingress router that accepts incoming requests and maps them to the internal canonical format used by DataService / workers.

Scope
- POST /ingest/:customer_id/:endpoint_slug — accepts payloads from customers
- Request validation + mapping to internal format (use registered endpoint schema)
- Authentication via API key (customer-specific), header or query param
- Emit events to DataService/outbox or push to worker queue

Acceptance criteria
- Request validation uses registered endpoint schema; returns 400 on validation error
- Mapping module translates the payload into internal resource objects and emits DataService events
- Unit tests for validation and mapping with mocks
- Integration/E2E that verifies end-to-end ingest path with a registered endpoint (CI gated)

Owners: Agent4 (scaffold & handler), Agent10 (scalability / rate-limit review)

Notes
- Rate limiting and per-customer throttling will be applied via Redis and rate-limit middleware
- Consider a lightweight plugin system to allow custom mapping rules per endpoint
