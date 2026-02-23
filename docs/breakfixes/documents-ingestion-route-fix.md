# Documents ingestion route — breakfix (2026-01-07) ✅

## Summary 🔧
A failing integration test (`api/tests/integration/documents.integration.test.js`) was caused by the ingestion endpoint returning 404. Root cause: the `POST /api/documents` route was not registered in `api/server.js`, so document ingestion requests were unhandled.

## Impact 🚨
- Integration test: **"POST /api/documents applies mapping if exists"** returned **404** instead of **201**.
- Blocked documents ingestion pipeline and related integration tests (documents ACK, unified flow, dashboard health).
- Affects Phase 28 demo scenarios where documents must be ingested and mapped.

## Root cause analysis 🔍
- The `createDocument` handler existed at `api/handlers/documents.js`, but the route for `POST /api/documents` was not registered in `api/server.js` (only GETs were registered).
- Tests run with `USE_MOCK_DB=true` and seeding created required mapping(s), but requests hit a 404 before handler logic executed.

## Fix implemented ✅
- Registered the ingestion route in `api/server.js`:
  - `app.post('/api/documents', { preHandler: [authMiddlewareForRoutes] }, (r, reply) => import('./handlers/documents.js').then(m => m.createDocument(r, reply)) )`
- Added targeted diagnostics:
  - Test logging in `api/tests/integration/documents.integration.test.js` to print DB state before test and confirm seeding.
  - Test-only debug log in `api/handlers/documents.js` to show incoming payload and calling user during tests.

## Files changed ✏️
- `api/server.js` — added `POST /api/documents` route (with `authMiddlewareForRoutes` preHandler)
- `api/handlers/documents.js` — added test-only debug log for `createDocument`
- `api/tests/integration/documents.integration.test.js` — added DB-state + creation logs to aid debugging

## Verification & Results ✅
- Ran isolated test with verbose output:
  - Command: `pnpm vitest run api/tests/integration/documents.integration.test.js --reporter=verbose`
  - Observed logs:
    - "🔍 TEST SETUP - DB state BEFORE test: TPs= 0 Mappings= 0"
    - "✅ Organization created: <id>"
    - "✅ Mapping created: <id>"
    - "📥 INCOMING REQUEST: POST /api/documents"
    - "[DOC TEST] createDocument called, body: {...} user: u1"
  - Result: Test passed (201 response, mapping applied)

## Notes / Next steps 💡
- The route fix unblocks the documents tests, but there remain a few other failing integration tests (trading-partners migration, dashboard/alerts flows). Those appear to be **seed/setup** issues rather than RBAC regressions.
- Recommended triage plan for remaining failures:
  1. Run each failing integration test in isolation with similar DB-state and handler logs.
  2. Ensure `resetMockDb()` is called at the correct times and seeds run after reset.
  3. Add minimal seeding helpers in tests where appropriate.

---

If you want, I can continue by triaging the next-highest failing test (`trading-partners.migration.test.js`) and follow the same approach (add DB-state logs → run in isolation → fix seeds or route).