> [!WARNING]
> Status: Planned / In Development
> Context: Original BF-INTEGRATION Vision (Pre-Phase 30)
# Admin Bridgeflow CTO Demo Checklist ✅

Follow these steps to verify Phase 13 readiness during the live demo.

1. Environment & Access
   - Start API in secure dev mode (see `start/api-start.ps1` or `pnpm run dev:secure`).
   - Confirm admin dev account available (use `_dev/login` or the fallback route for demo).
   - Ensure `REQUIRE_AUTH=true` and `ENFORCE_RBAC=true` for realistic checks.

2. Security first ✅
   - Login as admin and demonstrate MFA flow (use dev stub: TOTP `123456`).
   - Show audit logs are recorded for admin actions.

3. Tenant Management ✅
   - Search for a tenant in Tenant List.
   - Use "Login As" to impersonate a user and show a quick audit entry.

4. Account management (critical paths) ✅
   - Suspend an org (provide a reason), confirm owners receive notification and processing is paused.
   - Reactivate the org, schedule backlog processing, confirm `backlogProcessingRequested` flag and notification.
   - Demonstrate manual data correction (name/status change) and show rollback metadata in the audit entry.

5. Health & Operations ✅
   - Open Metrics dashboard (p50/p95/p99 cards, request volume chart, alerts list).
   - Trigger a simple job via API and show it appearing in Operations; demonstrate retry.

6. Emergency Controls ✅
   - Perform Global Pause → Resume, show env vars are set/cleared and metrics are reset.
   - Use Clear Cache (metrics) and show metrics cleared without Redis available.

7. Acceptance Criteria
   - CTO can perform tenant suspend/reactivate without dev help.
   - Metrics/Health show realistic data and alerts.
   - All admin flows produce audit entries.
   - No crashes or console errors during demo.

Notes & Known Issues (to mention during demo)
- We have intentionally excluded two non-critical test suites from Phase 13 gating:
  - `api/tests/users.test.js` — Vite transform failure
  - `api/tests/worker.integration.test.js` — memory allocation failure in full-run
- Both items are scheduled for Phase 14 triage and fix.

If you want, I can generate a short demo script with exact API calls and example payloads to paste into the demo terminal. Want that now?
