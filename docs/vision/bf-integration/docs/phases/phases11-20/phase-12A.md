> [!WARNING]
> Status: Planned / In Development
> Context: Original BF-INTEGRATION Vision (Pre-Phase 30)
# Phase 12 — Enterprise Features & Navigation System 🎯

**Status:** 🚧 IN PROGRESS (Dual-Track)
**Owner:** Backend (Layer 3) + Frontend (Navigation)
**Timeline:** Week 1-2 (Dec 23-30, 2025)

---

## Overview
Phase 12 delivers enterprise-grade data mapping capabilities alongside a unified navigation system. This dual-track approach builds technical depth for enterprise customers while creating an intuitive control panel for all platform features.

**Strategic Goals:**
- **Track 12A:** Enterprise data mapping (version control, templates, validation)
- **Track 12B:** Unified control panel navigation (layer-based discovery)

Both tracks can proceed in parallel and integrate naturally.

---

## Goals 🎯
- Provide a clean, professional landing page after authentication
- Enable customers to switch between multiple organizations
- Display subscription status and usage information clearly
- Offer a "Get Started" workflow for new customers
- Set foundation for future dashboard features (analytics, settings, support)

---

## Deliverables ✅

### Track 12A — Week 1 Scope (Enterprise Data Mapping)
1. **Data Mapping Version Control**
   - Model: mapping entities with versions, metadata, author, timestamp, commit message
   - APIs: `POST /api/mappings`, `GET /api/mappings/:id/versions`, `POST /api/mappings/:id/versions/restore`
   - UI: Save mapping as version, view version history, restore previous version, show diff between versions

2. **Mapping Templates & Reusable Components**
   - Template store for common mapping patterns
   - Import/export templates (JSON), apply template when creating a mapping
   - UI for browsing & selecting templates

3. **Validation Rules Engine**
   - Author validation rules (required fields, type checks, custom assertions)
   - Run validation rules against sample payloads and view failures as warnings/errors
   - Add rule editor + rule set assignment per mapping

4. **Testing Framework for Mappings**
   - Create/save test cases (input + expected output)
   - Run tests in UI and via `POST /api/mappings/:id/test`
   - Store results and expose in version history

5. **APIs & Backing Services**
   - Mapping storage with versioning support
   - Diff engine (text/structural) for mapping versions
   - Background job runner for long-running validation/test runs

---

### Track 12B — Control Panel Navigation (Status)
- **Status:** Scaffold created (`/web/control-panel.html`, `/web/control-panel/layer-3.html`), CSS and client JS implemented
- **Next:** Integrate icons, finalize color palette, add permission checks wired into backend, write unit and e2e tests
- **Priority:** Navigation scaffolding should be completed in parallel to Track 12A for discoverability

---

## Technical Design

### Dashboard Architecture
```
dashboard.html
├── Header (org switcher, user menu, logout)
├── Main Content Area
│   ├── Welcome Section (user greeting, quick actions)
│   ├── Stats Grid (4-column: subscription, usage, bridges, alerts)
│   ├── Get Started Checklist (collapsible, dismissible)
│   └── Recent Activity Feed (last 5 transactions/events)
└── Footer (docs links, support, status page)
```

### Data Flow
```
Dashboard Load
└─> GET /api/auth/me (current user + active org)
└─> GET /api/dashboard/stats (subscription, usage, counts)
└─> GET /api/organizations (user's orgs for switcher)
└─> Render UI with data

Org Switch Event
└─> POST /api/organizations/switch/:id
└─> Reload dashboard stats for new org context
└─> Update UI with new org data
```

### State Management
- Active organization stored in session cookie (`activeOrgId`)
- All dashboard API calls scoped to active org
- Org switcher updates session and triggers page refresh
- Local storage for "Get Started" checklist completion state

---

## Acceptance Criteria ✅
- [ ] User lands on dashboard immediately after login
- [ ] Dashboard displays current organization name and role
- [ ] Organization switcher shows all user's orgs with role badges
- [ ] Switching orgs reloads dashboard with correct context
- [ ] Subscription widget shows current plan and status
- [ ] "Upgrade Plan" button redirects to `/api/billing/subscribe`
- [ ] Get Started checklist appears for new users
- [ ] Checklist steps check off automatically as user completes actions
- [ ] Dashboard loads in <2 seconds with all data
- [ ] Mobile responsive (tested on 375px width)

---

## Design Mockup (ASCII)
```
┌─────────────────────────────────────────────────────────────┐
│ BridgeFlow                    [Acme Corp ▼]  [User Menu ▼]  │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  Welcome back, John! 👋                                      │
│  Your organization: Acme Corp (Owner)                        │
│                                                               │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐      │
│  │   Pro    │ │ 1,234 / │ │    12    │ │     2     │      │
│  │  Active  │ │  10,000  │ │ Bridges  │ │  Alerts   │      │
│  │ 📊 Plan  │ │ 📈 Usage │ │ 🔗 Active│ │ ⚠️ Pending│      │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘      │
│                                                               │
│  🚀 Get Started                                     [Dismiss]│
│  ─────────────────────────────────────────────────────────  │
│  ✅ Create organization                                      │
│  ⬜ Set up first bridge                                      │
│  ⬜ Configure webhook endpoint                               │
│  ⬜ Test first transaction                                   │
│                                                               │
│  📋 Recent Activity                                          │
│  ─────────────────────────────────────────────────────────  │
│  • Transaction #1234 succeeded          2 minutes ago       │
│  • Bridge "Shopify-NetSuite" created    1 hour ago          │
│  • Subscription upgraded to Pro         3 hours ago         │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

---

## Implementation Plan

### Day 1-2: Backend APIs
- [ ] Create `api/handlers/dashboard.js` with stats endpoint
- [ ] Add org switcher endpoint to organizations handler
- [ ] Enhance billing endpoint to return subscription with plan details
- [ ] Add tests for dashboard API responses
- [ ] Update auth middleware to set `activeOrgId` in session

### Day 3-4: Frontend Dashboard
- [ ] Create `web/dashboard.html` with layout structure
- [ ] Build organization switcher component (dropdown + switch logic)
- [ ] Create subscription widget with plan badge and status indicator
- [ ] Implement Get Started checklist with localStorage persistence
- [ ] Add recent activity feed (mock data for now)

### Day 5: Polish & Testing
- [ ] Add loading states and error handling
- [ ] Mobile responsive CSS
- [ ] E2E test: login → dashboard → switch org → verify stats update
- [ ] Cross-browser testing (Chrome, Firefox, Safari)
- [ ] Performance optimization (lazy load non-critical data)

---

## Future Enhancements (Post-MVP)
- Analytics charts (transaction volume, success rate, latency)
- Bridge health monitoring dashboard
- Webhook delivery logs
- API key management UI
- Team member management (invite/remove users)
- Organization settings (name, logo, billing info)
- Notification center (alerts, announcements)
- Support chat widget integration

---

## Dependencies
- Phase 11 complete (auth, orgs, billing endpoints working)
- Fastify session middleware configured for org context
- JWT token includes userId for /api/auth/me lookups
- Billing subscription model queryable by organizationId

---

## Risks & Mitigations ⚠️
- **Risk:** Dashboard becomes cluttered with too many widgets
  - **Mitigation:** Strict MVP scope, prioritize 4 key metrics only
- **Risk:** Org switching causes UX confusion (data mismatch)
  - **Mitigation:** Clear org name display, full page reload on switch
- **Risk:** Slow dashboard load due to multiple API calls
  - **Mitigation:** Combine stats into single `/dashboard/stats` endpoint

---

## Demo Checklist 🧪
- [ ] Login as user with 2+ organizations
- [ ] Dashboard shows first org's subscription (Pro plan, Active)
- [ ] Switch to second org using dropdown
- [ ] Verify dashboard updates with second org's data
- [ ] Click "Upgrade Plan" → redirected to billing subscribe page
- [ ] Complete Get Started step 1 (create org) → checklist updates
- [ ] Dismiss Get Started checklist → preference saved to localStorage
- [ ] Logout and login again → dashboard still shows active org

---

## Success Metrics 🎯
- Dashboard loads in <2 seconds (p95)
- Org switcher works with 0 errors
- 90% of new users complete at least 1 Get Started step
- 50% of users complete full Get Started checklist within 7 days
- Customer support tickets about "where do I start" drop by 70%

---

## References
- [Phase 11 Completion Notes](./PHASE-11.md)
- [Layer 4 Platform Core](../Layer4-PlatformCoreLayer/README.md)
- [Dashboard Wireframes](../design/dashboard-wireframes.md) (to be created)
- [Billing API Spec](../api/BILLING-API.md) (to be created)

