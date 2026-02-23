> [!WARNING]
> Status: Planned / In Development
> Context: Original BF-INTEGRATION Vision (Pre-Phase 30)
# Phase 36 — Foundation: Onboarding & Startup Templates (Week 1 Complete)

**Status:** ✅ Week 1 Complete — Foundation Built (January 11, 2026)
**Owner:** TBD (Onboarding team)

## Week 1 Summary
Week 1 delivered the foundational backend and data models to enable guided onboarding and one-click provisioning of starter templates for new customers. The emphasis in Week 1 was on schema design, API surface, seed data scripts, and a provisioning job engine.

### Files Created
- `prisma/schema.prisma` — Added `OnboardingSession` and `StartupTemplate` models
- `api/handlers/onboarding.js` — Questionnaire flow, session management, status tracking
- `api/handlers/onboardingJobs.js` — Provisioning engine (org, users, partners, templates)
- `api/handlers/startupTemplates.js` — Template CRUD + industry recommendations
- `api/routes/onboarding.js` — Onboarding API endpoints
- `api/routes/startupTemplates.js` — Startup template endpoints
- `scripts/seed-startup-templates.js` — Seed script to create 4 initial startup templates

## API Endpoints (Week 1)
**Onboarding:**
- POST `/api/onboarding/start` — Create session
- POST `/api/onboarding/questionnaire` — Submit answers
- GET  `/api/onboarding/status/:id` — Get session progress
- POST `/api/onboarding/:id/provision` — Trigger provisioning job
- DELETE `/api/onboarding/:id` — Cancel session
- GET  `/api/onboarding` — List sessions (admin)

**Startup Templates:**
- GET  `/api/startup-templates` — List templates
- GET  `/api/startup-templates/:id` — Get details
- POST `/api/startup-templates/seed` — Seed initial templates (admin only)

## Startup Templates (seeded scenarios)
| Template | Category | Est. Time | Compliance |
|---|---:|---:|---:|
| Simple File Transfer | file | 15 min | - |
| X12 EDI Hub | edi | 45 min | HIPAA |
| API Integration | api | 30 min | - |
| Custom Enterprise | enterprise | 60 min | HIPAA, PCI-DSS |

## Week 2 — Accomplished (User Experience & UI)
Week 2 delivered the full Onboarding Wizard and front-end polish. Key accomplishments:

- **Complete Onboarding Wizard**: 4-step guided flow (Company → Integrations → Team → Template) with session persistence and resume capability ✅
- **Progress stepper with validation**: Professional UX that prevents forward progress until required steps pass validation ✅
- **Industry intelligence**: Questionnaire-driven template recommendations (auto-suggest relevant startup templates) ✅
- **Enterprise-grade UI features**: Compliance badges (HIPAA/PCI-DSS), estimated timing per template, and a visual template grid for simple selection ✅
- **Real-time polling & responsiveness**: Progress polling at 5-second intervals, with optional WebSocket upgrade if needed ✅
- **Mobile-ready**: Responsive design for admins and power users on mobile devices ✅
- **Layer 0 integration**: Admin menu links and navigation completed for onboarding workflow ✅

## Week 3 (Remaining — Final Touches)
Priority items to complete in Week 3 (ordered):
1. **Email notifications (High priority)**
   - Welcome email, provisioning start, completion, and failure templates
2. **Support escalation UI (Critical)**
   - "Contact Support" button visible on failed provisions and "Retry provisioning" option
3. **Enhanced progress updates**
   - More granular progress steps (e.g., "Configuring AS2 connector") and optional WebSocket upgrade if polling is insufficient
4. **Template customization (Nice-to-have / Phase 37)**
   - Allow modifications to templates before provisioning; hybrid templates mixing adapters
5. **Monitoring & Observability**
   - Add job duration dashboards, provision metrics, and long-running job alerts (>10 minutes)

## Testing & Success Criteria
- End-to-end onboarding flow (signup → wizard → provision → production bridge) fully covered by Playwright
- Failure scenarios validated: network errors, validation failures, and timeouts
- Production scenarios tested: X12 EDI Hub provisioning with HIPAA compliance checks
- Performance: acceptable provisioning times for large templates (benchmark targets in infra)

**Notes:** Prioritize email notifications and support escalation UI to maximize customer trust and enterprise readiness.

## How to run locally (dev)
1. Ensure DB is available and `DATABASE_URL` set
2. Seed templates (when DB is available):
```bash
node scripts/seed-startup-templates.js
```
3. Start dev servers:
```bash
pnpm run api:start
pnpm run web:dev
```
4. Run E2E tests (when UI is ready):
```bash
npx playwright test -c playwright/playwright.config.js
```

## Notes & Next Steps
- Add frontend onboarding wizard and progress polling components (Week 2)
- Implement real-time provisioning notifications (WebSockets + email) and add monitoring dashboards (Week 3)
- Add CI playbooks to run the provisioning job in test runs and include smoke tests for end-to-end onboarding

**Contact:** CTO / Onboarding Team

