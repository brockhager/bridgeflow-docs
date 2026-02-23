# Phase 13 Verification - Self-Service Demo

## 🚀 Quick Start (5 minutes)
1. **Login:** https://admin.bridgeflow.example.com (use admin credentials)
2. **Verify:** MFA prompt appears → complete authentication
3. **Landing:** Tenant dashboard loads with search functionality

## ✅ Critical Paths to Test (15 minutes)

### A. Customer Management (Must Pass)
- Search for "TestCorp" → appears in results
- Click tenant → see user count, subscription plan
- Click "Impersonate" → opens new tab as customer

### B. Account Controls (Must Pass)
- Find "SuspendedTest" tenant
- Click "Reactivate" → confirmation appears
- Verify suspension lifted (status changes)

### C. Emergency Controls (Must Pass)
- Click "Global Pause" → system pauses (API returns 503)
- Click "Global Resume" → system resumes (API returns 200)
- Check health metrics (should show brief spike)

## 🎯 Acceptance Criteria
- [ ] Can login without engineering help
- [ ] Can find any customer in <30 seconds
- [ ] Can impersonate any user
- [ ] Can suspend/reactivate accounts
- [ ] Can pause/resume system globally
- [ ] No console errors during above flows

## 📞 If Issues Occur
1. Check `/docs/Layer0-Admin-Bridgeflow/KNOWN-ISSUES.md`
2. Quick rollback: `git checkout main~1`
3. Contact: Agent4 for technical, Scrum Master for process

---

# Demo Script (Operational Walkthrough)

Use this script as a guide for the 30-minute CTO demo. Commands below assume the API is running locally and admin auth is available via the dev stub.

1) Admin login (dev stub)

POST /admin-api/_dev/login

curl -X POST "http://localhost:3000/admin-api/_dev/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"dev@bridgeflow.com","password":"DevTest123!","totpToken":"123456"}'

Response includes `accessToken` and `user` object — use `accessToken` for subsequent calls.

2) Tenant search & impersonation
- Open Tenant list in the UI, search for `Acme`.
- Use "Login As" button or use the impersonation API (see `CLI-CHEATSHEET.md`).

3) Suspend & Reactivate
- Suspend: POST `/admin-api/tenants/:id/suspend` with `{ reason: 'maintenance', notifyCustomer: true }`.
- Confirm audit log entry exists: GET `/api/audit?query=user.role_changed` or check admin audit UI.
- Reactivate: POST `/admin-api/tenants/:id/reactivate` with `{ processBacklog: true }` and confirm `backlogProcessingRequested` flag.

4) Show Metrics
- Open APIMetrics page, point out p50/p95/p99 cards and recent alerts.
- Trigger a small request load (e.g., call `/api/health` 10 times) and show request volume change.

5) Emergency flow
- Global pause: POST `/admin-api/emergency/global-pause` with `{ reason: 'demo pause' }`.
- Resume: POST `/admin-api/emergency/global-resume` and confirm metrics cleared (GET `/admin-api/metrics/summary`).

6) Wrap up
- Show audit logs for the actions performed.
- Explain known test exclusions and Phase 14 plan.

Notes:
- For demo, use small payloads and avoid running worker or heavy integration tests.
- If email notifications are needed during demo, use `scripts/test-email-flow.js` to inspect delivered emails.