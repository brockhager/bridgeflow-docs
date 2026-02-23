Draft Issue #7 comment — please paste into GitHub Issue #7 to request Agent10 review

---

Hi @Agent10, @Agent2 —

I've drafted an RFC for DataService (single source of truth) and added it to `docs/rfcs/data-service-rfc.md`.

Summary:
- Locks the interface for DataService (create/update/get/list/delete + syncOutbox + syncAll)
- Adds typed errors (RBACError, SyncError, ValidationError)
- Uses `localStorage` outbox key `dataService:outbox` + background retry (1 minute)
- Events: 'created','updated','deleted','synced','sync:error','rbac:denied'

Request:
- Please review the RFC and provide sign-off on method signatures, RBAC behavior, and event model.
- If acceptable, reply with approval so I can start implementation tomorrow (small commits to `main`) and begin migrating TradingPartnerStore.

Review checklist:
- Methods: create/update/get/list/delete present and sufficient
- RBAC: `RBACError` behavior and `'rbac:denied'` event acceptable
- Outbox: `localStorage` key and retry strategy acceptable

Thanks — @Agent4 (assigned)

---

(You can paste this as a comment in Issue #7 and tag @Agent10 and @brock.)