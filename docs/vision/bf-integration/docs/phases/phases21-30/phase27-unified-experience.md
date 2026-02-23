> [!WARNING]
> Status: Planned / In Development
> Context: Original BF-INTEGRATION Vision (Pre-Phase 30)
# Phase 27: Enterprise Workflow Unification

**Goal:** Transform disconnected tools into a seamless, end-to-end B2B integration platform experience.

**Status:** In Progress  
**Started:** January 3, 2026

---

## 🔗 Core Problem: Fragmented User Journey

**Current State:**
- User creates Trading Partner in `/create-tp`
- Goes to Canvas to visualize connections
- Sends EDI 210 → document appears in `/alerts` if stuck
- Manually retries failed documents
- **Problem:** User jumps between disconnected contexts with no unified view

**Desired State:**
- Single coherent platform where all actions flow naturally
- Live status updates in primary workspace (Canvas)
- Proactive system health monitoring on homepage
- Unified activity timeline across all operations

---

## ✅ Phase 27 Deliverables

### 1. System Health Summary (Homepage Dashboard)
**Route:** `/` (existing route enhanced)  
**Purpose:** First thing user sees — proactive system status

**Features:**
- **Health Badge:** "✅ All systems normal" or "⚠️ Action needed"
- **Recent Activity Metrics:** "12 docs processed in last hour"
- **Action Items:** "1 stuck document" with direct link to `/alerts`
- **Quick Actions:** Links to Canvas, Create TP, View Activity

**RBAC:**
- **Customers (Layer 1-4):** See their org's health only
- **BF Employees (Layer 0):** See system-wide metrics + tenant breakdown

**API Endpoint:**
- `GET /api/dashboard/health` → returns:
  ```json
  {
    "health": "OK" | "WARNING" | "CRITICAL",
    "recentActivityCount": 12,
    "actionItems": [
      {
        "type": "STUCK_DOCUMENT",
        "count": 1,
        "link": "/alerts"
      }
    ],
    "uptime": "99.8%"
  }
  ```

---

### 2. Contextual Document Tracking in Canvas
**Route:** `/canvas` (existing route enhanced)  
**Purpose:** Live operational status for each Trading Partner

**Visual Indicators:**
- ✅ **Green dot:** "All flows healthy" (no stuck/failed docs in last 24h)
- ⚠️ **Yellow dot:** "1 pending document" (doc in RECEIVED/PARSING state)
- ❌ **Red dot:** "Alert: 210 stuck" (document > 2 min in RECEIVED state)

**Interaction:**
- Click TP node → Popover shows:
  - Recent documents (last 5)
  - Doc status counts (3 healthy, 1 stuck)
  - "View Alerts" button (deep link to `/alerts?partnerId=<id>`)

**API Endpoint:**
- `GET /api/trading-partners/:id/doc-status` → returns:
  ```json
  {
    "partnerId": "tp_abc123",
    "partnerName": "LOGISTICS_INC",
    "docCounts": {
      "healthy": 3,
      "pending": 0,
      "stuck": 1
    },
    "recentDocs": [
      {
        "id": "doc_123",
        "docType": "210",
        "status": "ACK_GENERATED",
        "createdAt": "2026-01-03T10:02:00Z"
      }
    ],
    "healthStatus": "WARNING"
  }
  ```

---

### 3. Unified Activity Stream
**Route:** `/activity` (new SPA route)  
**Purpose:** Timeline view of all B2B operations

**Timeline Events:**
- "May 3, 10:02 AM — Received 210 from LOGISTICS_INC"
- "May 3, 10:03 AM — Generated 997 (ACK)"
- "May 3, 10:05 AM — Alert: 210 processing failed → Retried"

**Filters:**
- By Trading Partner (dropdown)
- By Document Type (210, 997, etc.)
- By Status (received, ack_generated, failed)
- By Date Range

**RBAC:**
- **Customers:** See only their org's events
- **BF Employees:** See all events across all tenants

**API Endpoint:**
- `GET /api/activity?partnerId=<id>&docType=210&status=FAILED` → returns:
  ```json
  {
    "events": [
      {
        "timestamp": "2026-05-03T10:02:00Z",
        "type": "DOCUMENT_RECEIVED",
        "partnerId": "tp_abc123",
        "partnerName": "LOGISTICS_INC",
        "docType": "210",
        "docId": "doc_123",
        "status": "RECEIVED",
        "details": "Received 210 with 3 shipments"
      },
      {
        "timestamp": "2026-05-03T10:03:00Z",
        "type": "ACK_GENERATED",
        "partnerId": "tp_abc123",
        "partnerName": "LOGISTICS_INC",
        "docType": "997",
        "parentDocId": "doc_123",
        "details": "Generated 997 acknowledgment"
      }
    ],
    "totalCount": 47
  }
  ```

---

### 4. Smart Default Workflows
**Purpose:** Reduce manual steps with intelligent suggestions

**Auto-Suggestions:**
- When user creates TP → Modal: "Add a 210 mapping?" (link to mapper)
- When user creates TP → Modal: "Configure AS2 connection?" (link to connection setup)
- When 210 arrives with unknown sender → Auto-create TP (if org rules allow)

**Implementation:**
- On `/create-tp` success → redirect to Canvas with TP pre-added
- Add `autoCreatePartner` boolean to Organization model (default false)
- Update ingest handler to create TP when `autoCreatePartner=true` and sender unknown

---

### 5. End-to-End Test Scenario
**Purpose:** Validate full unified experience in test suite

**Test Flow:**
1. Create Trading Partner via POST `/api/trading-partners`
2. Send EDI 210 via POST `/ingest/:customer_id/:endpoint_slug`
3. Verify 997 ACK generated (GET `/api/documents/:id/ack`)
4. Simulate processing failure (force status=FAILED)
5. Check alert appears in GET `/api/alerts`
6. Retry document via POST `/api/documents/:id/retry`
7. Verify success (status=ACK_GENERATED)

**Test File:** `api/tests/integration/phase27-unified-flow.test.js`

---

## 🛠 Technical Integration Points

| Gap | Fix |
|-----|-----|
| TP created, but no mapping | On `/create-tp` success, redirect to Canvas with TP pre-added |
| Docs processed, but user doesn't know | Add real-time updates via SSE or polling in Canvas |
| Alerts exist, but not linked to TP | Add `partnerId` to Document → join in UI |
| No "big picture" view | Add homepage dashboard with health + activity |

---

## 🏗 Data Model Changes

### Document Model
```prisma
model Document {
  // ... existing fields
  partnerId String?  // NEW: Link to TradingPartner.id
  
  // Relation
  partner TradingPartner? @relation(fields: [partnerId], references: [id])
}
```

### TradingPartner Model
```prisma
model TradingPartner {
  // ... existing fields
  status String @default("ACTIVE")  // NEW: ACTIVE | ONBOARDING | SUSPENDED
  
  // Relation
  documents Document[]  // NEW: One-to-many with Documents
}
```

### Organization Model (Optional)
```prisma
model Organization {
  // ... existing fields
  autoCreatePartner Boolean @default(false)  // NEW: Auto-create TP when unknown sender
}
```

---

## 🎨 UX Principle: Progressive Disclosure

**New User:**
- Homepage shows: "Add your first trading partner" (guided onboarding)
- Canvas is empty with "+ Add Partner" prompt

**Experienced User:**
- Homepage shows: Health dashboard + recent activity metrics
- Canvas shows: All TPs with live status indicators

**BF Employee:**
- Homepage shows: System-wide alerts + tenant metrics
- Alerts page shows: All tenants' stuck documents

---

## ✅ Success Criteria

**End-to-End User Flow:**
1. New customer logs in → sees homepage dashboard
2. Creates Trading Partner
3. Sends EDI 210 (via curl or file upload)
4. Sees auto-generated 997 ACK in Canvas status
5. If 210 fails → sees alert indicator on TP node in Canvas
6. Clicks TP → "View Alerts" button → retries document
7. Document succeeds → green dot appears on TP

**No context switching. No log checking. One unified platform.**

---

## 📋 Implementation Checklist

### Phase 27.1: Homepage Dashboard (Highest Priority)
- [ ] Create `GET /api/dashboard/health` endpoint
  - [ ] Return health status (OK/WARNING/CRITICAL)
  - [ ] Count recent activity (docs processed in last hour)
  - [ ] List action items (stuck docs count)
- [ ] Update `/` route frontend
  - [ ] Fetch dashboard health on load
  - [ ] Show health badge with color coding
  - [ ] Display recent activity metrics
  - [ ] Add quick action links (Canvas, Create TP, Alerts)
- [ ] Add RBAC: customers see org-only, BF employees see system-wide
- [ ] Test: Unit test for health calculation, integration test for API

### Phase 27.2: Canvas TP Status Indicators
- [ ] Database: Add `partnerId` to Document model, run migration
- [ ] Database: Add `status` to TradingPartner model, run migration
- [ ] Create `GET /api/trading-partners/:id/doc-status` endpoint
  - [ ] Count docs by status (healthy, pending, stuck)
  - [ ] Fetch recent documents (last 5)
  - [ ] Calculate health status (green/yellow/red)
- [ ] Update Canvas frontend
  - [ ] Fetch doc status for each TP on render
  - [ ] Add status dot SVG overlays (green/yellow/red)
  - [ ] Add tooltip on hover (doc counts)
  - [ ] Add click handler → show popover with recent docs + "View Alerts" button
- [ ] Update ingest handler to set `partnerId` on created Document
- [ ] Test: Integration test for doc-status endpoint, E2E test for Canvas indicators

### Phase 27.3: Unified Activity Stream
- [ ] Create `GET /api/activity` endpoint
  - [ ] Query Documents with joins (partner, org)
  - [ ] Format as timeline events (received, ack_generated, retried)
  - [ ] Support filters (partnerId, docType, status, dateRange)
- [ ] Create `/activity` SPA route
  - [ ] Fetch activity timeline on load
  - [ ] Render events with timestamps and partner names
  - [ ] Add filter UI (dropdowns, date picker)
  - [ ] Add RBAC guard (customers see org-only, BF sees all)
- [ ] Test: Unit test for event formatting, integration test for filters

### Phase 27.4: Smart Default Workflows
- [ ] Update `/create-tp` success handler
  - [ ] Show modal: "Add a 210 mapping?" with link
  - [ ] Redirect to Canvas with TP pre-selected
- [ ] Database: Add `autoCreatePartner` to Organization model
- [ ] Update ingest handler
  - [ ] If unknown sender + autoCreatePartner=true → create TP
  - [ ] Set partnerId on Document
- [ ] Test: Integration test for auto-create TP flow

### Phase 27.5: End-to-End Integration Test
- [ ] Create `api/tests/integration/phase27-unified-flow.test.js`
  - [ ] Test: Create TP → send 210 → verify ACK → fail doc → alert → retry → success
  - [ ] Assert: partnerId set on Document
  - [ ] Assert: alert appears in GET /api/alerts
  - [ ] Assert: retryCount increments
- [ ] Create Playwright test for full UI flow
  - [ ] Test: Login → homepage health → create TP → Canvas status indicator

---

## 🚀 Why This Matters

**What enterprise buyers pay for:**
> "We don't want 5 tools. We want one system that works."

**Phase 27 is not about adding features — it's about delivering outcomes.**

You're creating a platform where every action flows naturally into the next. Users see their entire B2B ecosystem at a glance, with proactive alerts and one-click resolution.

This is what turns a collection of microservices into a **product people trust**.

---

**Next Steps:** Begin with homepage dashboard and Canvas TP status indicators — the highest-leverage integration that ties everything together in the user's primary workspace.

