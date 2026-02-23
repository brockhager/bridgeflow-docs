# DataService — Single Source of Truth (RFC)

Status: Draft — Requesting architecture review from @Agent10

## Summary
Make `DataService` the canonical client-side sync hub for entity data (TradingPartner, Bridge, Platform entities). Start with the existing UI file `web/src/core/DataService.js`, lock the interface, and add tests that prove cross-store consistency. This RFC documents method signatures, event model, error types, and migration steps.

## Proposed Interface
Example API (JSDoc style):

```javascript
class DataService {
  constructor({ baseUrl, authProvider })

  // CRUD (TradingPartner examples)
  async createTradingPartner(payload) // -> { ok: true, data }
  async updateTradingPartner(id, payload) // -> { ok: true, data }
  async getTradingPartner(id) // -> { ok: true, data }
  async listTradingPartners(query?) // -> { ok: true, data: [] }
  async deleteTradingPartner(id) // -> { ok: true }

  // Sync & Outbox
  async syncOutbox() // -> { synced: number, failed: number }
  async syncAll() // -> trigger sync of relevant entity outboxes

  // Subscriptions
  subscribe(entityType, event, callback) // returns unsubscribe
  unsubscribe(entityType, event, callback)
}
```

## Events
- `'created'`, `'updated'`, `'deleted'` — entity lifecycle
- `'synced'` — outbox items successfully synced
- `'sync:error'` — error during sync
- `'rbac:denied'` — RBAC permission denial (403) surfaced as event

## Error types
- `RBACError` (403) — contains { code: 'rbac', permission, message }
- `SyncError` — contains sync details and original error
- `ValidationError` — payload validation failures

Errors should be thrown as typed Error-like objects (or rejected Promises). The UI store should catch and handle `RBACError` gracefully (show user message; do not crash).

## Persistence & Outbox
- Keep `localStorage` outbox (key: `dataService:outbox`) — tests rely on this.
- Retry strategy: `syncOutbox()` manual trigger + automatic background retry every 1 minute.
- Full exponential backoff deferred to Phase 18.

## Auth & RBAC
- `DataService` must use injected `authProvider` to attach JWT headers automatically.
- On 403 responses, emit `'rbac:denied'` and throw `RBACError` so stores can react.

## Data Flow
UI Store → DataService → (Auth + RBAC) → Backend store layer (store classes) → DB

## Migration Plan
1. Lock DataService interface via tests (update `test/integration/DataService.integration.test.js` and `DataService.cross-store.test.js`)
2. Migrate `web/src/stores/TradingPartnerStore.js` to delegate to DataService (prefer DataService when present; fall back to existing adapter)
3. Update `web/src/canvas-controller.jsx` to pass `window.dataService` into TP store if available
4. Repeat for `BridgeStore`
5. Introduce `PlatformStore` skeleton (inherits EntityStore pattern) and connect via DataService

## Tests & Acceptance
- Use `USE_MOCK_DB=true` for CI speed; add one SQLite integration test for cross-store validation.
- Tests should assert: create/update/get/list/delete behavior; outbox enqueue/sync; `'rbac:denied'` event firing.
- Maintain >85% coverage for DataService-related code.

## Rollout notes
- Start in UI-only mode (no backend DataService migration). If cross-repo server work is needed later, extract shared logic to `api/lib/DataService.js` and add server-side handlers.

## Request for Review (Action Items)
- Please review method signatures, event names, and error types.
- Confirm background retry interval (1 minute OK for now).
- Confirm that `localStorage` outbox and the key `dataService:outbox` is acceptable.

Tagging: @Agent10 (arc review) @Agent2 (scrum) @brock (cto)

---

Timestamp: 2025-12-28T00:00:00Z

(If approved, I will implement minimal interface + tests and update Issue #7 with PR status.)