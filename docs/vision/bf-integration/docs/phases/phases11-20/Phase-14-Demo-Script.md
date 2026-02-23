> [!WARNING]
> Status: Planned / In Development
> Context: Original BF-INTEGRATION Vision (Pre-Phase 30)
# Phase 14 — Trading Partner Management — CTO Demo Script

Purpose: A short, step-by-step demo script to verify the Trading Partner management feature and the migration flow.

Estimated time: 10 minutes

Preparation
- Ensure you have a Customer_Admin user (use test dev account if needed).
- Optionally populate localStorage with sample partners to exercise the migration flow:
  - In browser console: localStorage.setItem('bridgeflow_partners', JSON.stringify([{id:'l1',name:'Local A'},{id:'l2',name:'Local B'}]))

Steps
1. Login as Customer_Admin
   - Expected: Successful login, user role is `customer_admin`.

2. Open main navigation and verify the "🤝 Manage Trading Partners" menu item is visible
   - Expected: Top-level menu labeled "Trading Partners" shown to Customer_Admins

3. Click "Manage Trading Partners" → lands on Trading Partners dashboard (/web/trading-partners/manage.html)
   - Expected: Page shows list panel and action buttons (+ Add TP)

4. If localStorage entries exist, observe migration banner
   - Expected: Banner text: "We found existing trading partners in your browser. Migrate them to cloud storage?"
   - Actions: Click "Migrate Now"

5. Migration flow
   - Expected: Progress modal opens, shows total to migrate, progress bar, success/failed counts
   - Wait until text shows: "Migration complete. X succeeded, Y failed."
   - After success: localStorage key `bridgeflow_partners` should be removed
   - The TP list should be refreshed from the API (reflect migrated partners)

6. CRUD smoke (API path)
   - Add a trading partner using the + Add TP form (Name, Type, Status)
   - Expected: New partner appears in the list and persists after refresh
   - Edit the partner details → save → verify update persisted
   - Delete the partner → verify removed and list refreshes

7. Edge cases
   - Duplicate names during migration are reported (server returns per-item result)
   - Network failures during migration will display a friendly message and not delete local data

Success Criteria (pass if all true)
- Customer_Admin can see and open Manage Trading Partners
- Migration banner appears when localStorage partners exist
- Migration finishes with no data loss for migrated items (successful ones exist in DB)
- CRUD operations persist to server and survive page reload

Rollback instructions (if needed)
- If migration created unwanted items, remove them via API/admin endpoints:
  - Use Admin UI or hit DELETE /api/trading-partners/:id for the affected partners
- If local copies were removed accidentally, re-add sample data via browser console

Notes & Known Limitations
- Migration skips duplicates by name and reports them in results (front-end shows success/failed counts)
- Credentials stored in TP records are currently plain-text for MVP; Phase 15 will add secret management (Vault)

Contact
- For any blocker during demo, open an issue and tag @brockhager (owner) and Agent4 for immediate triage.

