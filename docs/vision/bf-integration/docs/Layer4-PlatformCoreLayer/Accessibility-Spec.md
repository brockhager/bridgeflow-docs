> [!WARNING]
> Status: Planned / In Development
> Context: Original BF-INTEGRATION Vision (Pre-Phase 30)
# Accessibility Specification — Layer 4 Admin UI

Principles
- Keyboard-first navigation and proper focus management
- Screen-reader friendly announcements for asynchronous actions
- Clear ARIA roles and labels for interactive controls

Implemented Items
- Modals: `role="dialog"`, `aria-modal="true"`, focus management (focus first input, Escape closes) ✅
- Buttons & controls: ARIA labels where context is ambiguous (e.g., action buttons include email in label) ✅
- Live region: `web/src/accessibility.js` provides `announce(message, level)` to publish polite/assertive messages via an ARIA live region. Messages are deduped and auto-cleared. ✅

Test coverage
- Unit tests: `web/tests/accessibility.test.js` (live region behavior)
- Integration tests: `web/tests/admin.users.test.js` and `web/tests/admin.audit.test.js` assert announcements and keyboard behaviors.

Recommendations
- Add ARIA live messages for any long-running server actions (export, background processing)
- Consider visual toast component paired with ARIA announcements for sighted users

