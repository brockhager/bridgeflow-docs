> [!WARNING]
> Status: Planned / In Development
> Context: Original BF-INTEGRATION Vision (Pre-Phase 30)
# Verification Checklist & Session Script

Purpose: A short, actionable checklist and script for CTO verification of Layer 4.

Session (30 minutes)
1. Goals recap (2 min)
2. Live demo (8 min)
   - Audit UI: apply filters, search, paginate, export CSV
   - Users UI: create user, change role, disable user
   - Monitoring: show metrics, create a rule that triggers, show event created and resolved in UI
3. Accessibility checks (6 min)
   - Keyboard navigation, Escape to close modals
   - Screen reader announcements (live region)
4. Security checks (6 min)
   - Confirm non-admin cannot modify roles
   - Confirm audit events recorded and visible in Audit UI
   - Confirm non-operator cannot view monitoring UI
5. Wrap-up (4 min)

Checklist (technical)
- [ ] All frontend tests pass locally (`pnpm -s test`) ✅
- [ ] RBAC enforcement verified (server returns 403 for unauthorized) ✅
- [ ] Audit writes observed for user changes ✅
- [ ] Accessibility checks: focus/aria/live-region ✅
- [ ] Export operation triggers announcements and completes ✅
- [ ] Alert persistence exists (check DB tables `AlertRule` and `AlertEvent`) ✅
- [ ] Evaluator triggers events (create a rule with `threshold: 0` and confirm an `AlertEvent` with `status: triggered`) ✅
- [ ] Audit entries for lifecycle events exist (`alert.created`, `alert.triggered`, `alert.resolved`, `alert.deleted`) ✅
- [ ] Notification delivery sanity check (create a rule with a webhook pointing to a test receiver and confirm delivery/retries) ✅
- [ ] UI: events appear in active list; manual resolve changes state and is reflected in history ✅

Success criteria
- No critical accessibility or security issues found
- All key flows work and evidence (logs/tests) available

Phase 17 verification status
- ✅ Phase 17 (RBAC foundation, test hardening) verified and CTO-signed off on Dec 29, 2025.
- Key evidence: Green test suite locally (unit + integration), RBAC fallback tested, admin UI flows verified.

Phase 18 verification checklist (kickoff)
- [ ] Create Phase 18 GH issues from `docs/issues/phase-18-*.md` and assign owners
- [ ] Add CI job to run integration/E2E tests gated to main/PR branches
- [ ] Implement `customer_api_keys` schema + handlers and add unit tests
- [ ] Implement `/ingest/:customer_id/:endpoint` router, wire API-key middleware and per-org rate limiter
- [ ] Add an E2E test that creates API keys via public API, posts to `/ingest`, validates metrics and rate-limit behavior

Artifacts to deliver for Phase 18 kickoff
- Links to newly opened issues and PRs
- E2E CI run showing Redis + SQLite test passing
- Short runbook for API-key rotation & revocation (documented in `docs/` or `docs/issues/` drafts)

