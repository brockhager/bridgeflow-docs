# Phase 33: Bridge Firewall Components (Layer 4)

**Status**: 🚀 In Progress — Layer 1 Canvas Styling Complete
**Date**: 2026-01-10
**Current Phase**: Layer 1 Canvas implementation + static red indicator styling
**Next**: Layer 4 Firewall Builder page, API integration, full workflow automation

## Overview
Phase 33 implements dual firewall components as structural bridge-edge elements, positioned between the Adapter and Connector on each side of the bridge. Firewalls serve as Layer 4 (Network/Transport) security gates, allowing configuration of public IPs, allowed ports, and TCP/UDP protocols. The phase emphasizes a **layered, progressive-disclosure workflow**: Canvas (Layer 1) displays required slots in static red; clicking opens a focused Layer 4 builder form; returning to Canvas auto-adds the component to the palette.

## Design Principles

### 🎨 Visual Clarity (No Motion Distractions)
- **Static red dashed border** (`#ef4444`) for required empty firewall slots — no blinking or animation
- **Light red background** (`#fef2f2`) for emphasis and accessibility
- **Clear status indicators**: 🔴 (red dot for empty), 🟢 (green dot for filled)
- **Professional hover effects**: Smooth 120ms transition with subtle shadow lift on interaction
- Goal: Users instantly recognize "required but missing" without animation fatigue

### 🧠 Layered Workflow (Progressive Disclosure)
Instead of an all-in-one form on Canvas:
1. **Layer 1 (Canvas)**: Display firewall slots with red required indicator. Click → navigate to builder.
2. **Layer 4 (Firewall Builder)**: Focused, single-purpose form with only Layer 4 fields (public IP, allowed ports, protocol).
3. **Return to Canvas**: Detect `?newFirewallId=...` in URL, auto-add firewall to palette, highlight it.

This separation keeps Canvas clean and focused while enabling deeper configuration without cognitive overload.

### 🔐 Security & Data Boundaries
- **Public IP Only** on Layer 4 (no internal IPs, no sensitive data in UI)
- **Allowed Ports** as a simple list or range (user-friendly)
- **TCP/UDP Protocol** selector (not a complex rule engine)
- **No Rule IDs or Internal References** exposed to users (future Layer 5 concern)

## Current Implementation (Layers 1 & 4)

### ✅ Layer 1: Canvas Styling (assembly.js)
```css
/* Static red border + background for required empty firewall slots */
.firewall-slot.firewall--required {
  border: 2px dashed #ef4444;
  background: #fef2f2;
  box-shadow: 0 0 0 0;
  animation: none;  /* Static, no motion */
}

.firewall-slot.firewall--required:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(239, 68, 68, 0.12);
  border-color: #dc2626;
}

/* Filled firewall slot (grey) */
.firewall-slot.firewall--filled {
  border-color: #cbd5e1;
  background: #f8fafc;
}
```

### ✅ DOM Structure (firewall.js)
```javascript
export function createFirewallSlot(slotKey, config, isFilled, blueprintId) {
  // Returns a complete <div class="firewall-slot"> element
  // with:
  //   - Shield icon (🛡️)
  //   - Status dot (🔴 empty or 🟢 filled)
  //   - Label ("Source Firewall" / "Dest Firewall")
  //   - Click handler → navigate to Layer 4 builder
  //   - 5s hover guidance tooltip
  //   - Accessibility (role=button, tabindex=0, keyboard support)
}
```

### ✅ Hover Guidance
- **Delay**: 5 seconds before tooltip appears (prevents accidental triggers)
- **Message**: "Add firewall configuration to enable secure connection" (generic, applies to both sides)
- **Indicator**: Hidden `.firewall-missing` div reveals on 5s hover with text "Required"

### ✅ Tests (firewall.static-red.test.js)
8 comprehensive DOM-focused tests covering:
- Static red styling for required empty slots
- Grey styling for filled slots
- Tooltip 5s delay and message correctness
- Missing indicator visibility on 5s hover
- Click handler and keyboard activation (Enter/Space)
- Accessibility attributes (`role=button`, `tabindex=0`, keyboard support)

**Test Status**: ✅ 8/8 passed; All 87 web tests passing (38 test files)

## Planned Implementation (Layers 4 & 1 Integration)

### Layer 4: Firewall Builder Page
**File**: `web/firewall-builder/builder.html` and `builder.js`

**Form Fields**:
- **Public IP** (text input, validation: valid IPv4/IPv6)
- **Allowed Ports** (text input, comma-separated or range notation)
- **Protocol** (radio buttons or select: TCP, UDP, Both)
- **Save Button** → API call to persist
- **Cancel Button** → return to Canvas without saving

**UX Flow**:
```
1. User sees red firewall slot on Canvas
2. Clicks slot → navigates to /firewall-builder?side=source|dest&returnTo=/canvas-assembly
3. Fills form (public IP, ports, protocol)
4. Clicks Save → POST /api/firewall { bridgeId, side, config }
5. Redirect: /canvas-assembly?newFirewallId={id}
6. Canvas detects ?newFirewallId, adds to palette, highlights briefly
```

### API Integration
**Endpoints** (to be implemented in `api/handlers/firewall.js`):
- `POST /api/firewall` — Create/update firewall config
  - Auth: user must own bridge's org
  - Payload: `{ bridgeId, side: 'source|dest', config: { publicIp, allowedPorts, protocol } }`
  - Response: `{ id, bridgeId, side, config, createdAt }`
- `GET /api/firewall/:id` — Retrieve firewall config
- `DELETE /api/firewall/:id` — Remove firewall (soft delete, preserve audit trail)

**Database** (Prisma schema addition):
```prisma
model Firewall {
  id String @id @default(cuid())
  bridgeId String
  bridge Bridge @relation(fields: [bridgeId], references: [id], onDelete: Cascade)
  side String // 'source' | 'dest'
  publicIp String
  allowedPorts String // "80,443" or "8000-9000"
  protocol String // "TCP" | "UDP" | "BOTH"
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  
  @@unique([bridgeId, side]) // One firewall per side per bridge
  @@index([bridgeId])
}
```

### Canvas Integration (assembly.js)
**Update `BRIDGE_SLOT_CONFIG`**:
```javascript
const BRIDGE_SLOT_CONFIG = {
  'source-firewall': {
    type: 'firewall',
    label: 'Source Firewall',
    hint: 'Firewall for inbound traffic',
    required: true,
    position: { x: 80, y: 120, width: 70, height: 50 }
  },
  'dest-firewall': {
    type: 'firewall',
    label: 'Dest Firewall',
    hint: 'Firewall for outbound traffic',
    required: true,
    position: { x: 650, y: 120, width: 70, height: 50 }
  },
  // ... existing slots
}
```

**Render Firewall Slots**:
```javascript
function renderFirewalls(bridge, canvas) {
  const sourceFirewall = bridge.firewalls.find(f => f.side === 'source')
  const destFirewall = bridge.firewalls.find(f => f.side === 'dest')
  
  const sourceSlot = createFirewallSlot(
    'source-firewall',
    BRIDGE_SLOT_CONFIG['source-firewall'],
    !!sourceFirewall,
    bridge.blueprintId
  )
  const destSlot = createFirewallSlot(
    'dest-firewall',
    BRIDGE_SLOT_CONFIG['dest-firewall'],
    !!destFirewall,
    bridge.blueprintId
  )
  
  canvas.appendChild(sourceSlot)
  canvas.appendChild(destSlot)
}
```

**Return from Builder**:
```javascript
// In initAssembly(), detect ?newFirewallId parameter
const params = new URLSearchParams(window.location.search)
const newFirewallId = params.get('newFirewallId')
if (newFirewallId) {
  // Fetch firewall, add to palette (like TPs)
  const fw = await firewallBuilderApi.getFirewall(newFirewallId)
  store.state.firewalls = store.state.firewalls || []
  store.state.firewalls.push(fw)
  highlightFirewallInPalette(newFirewallId, 2500) // 2.5s highlight
}
```

## Acceptance Criteria (Layer 1 — Complete)

- [x] Static red dashed border (`#ef4444`) on required empty firewall slots
- [x] Light red background (`#fef2f2`) for emphasis
- [x] No animation or blinking — clean, professional appearance
- [x] Hover effect: smooth 120ms transition with subtle shadow
- [x] Status indicators: 🔴 (empty), 🟢 (filled)
- [x] 5s hover tooltip: "Add firewall configuration to enable secure connection"
- [x] Missing indicator reveals on 5s hover
- [x] Click slot → navigates to `/firewall-builder?side={source|dest}&returnTo=/canvas-assembly`
- [x] Keyboard accessibility: Enter/Space activates slot
- [x] DOM rendering tests (8 tests, all passing)
- [x] All 87 web tests passing

## Acceptance Criteria (Layer 4 — Complete)

- [x] Layer 4 firewall builder page created and styled (`web/firewall-builder/builder.html`, `builder.js`)
- [x] Form fields with validation:
  - [x] Public IP (IPv4/IPv6) with strict validation
  - [x] Allowed Ports (single, ranges, comma-separated) with port range validation
  - [x] Protocol (TCP, UDP, BOTH) selector
- [x] Clean, focused UI: gradient background, centered card, professional styling
- [x] Error handling: form validation errors inline, API errors in error banner
- [x] Loading states: form hidden during save, spinner visible, buttons disabled
- [x] URL parameters: `?side=source|dest&returnTo=/canvas-assembly`
- [x] Accessibility: focus states, keyboard support, form labels, error messages
- [x] Save button: navigates to builder, forms data, returns with `?newFirewallId={id}`
- [x] Cancel button: returns to Canvas without saving
- [x] 25 comprehensive tests (IP, ports, protocol, form validation, DOM interaction, loading states)
- [x] All 112 web tests passing (39 test files)
- [x] API wrapper: `firewallBuilderApi.js` with CRUD methods

## Acceptance Criteria (Canvas Integration & Return Flow — Pending)

- [ ] Canvas integration: Update `BRIDGE_SLOT_CONFIG`, render firewall slots
- [ ] API endpoints: `POST /api/firewall`, `GET /api/firewall/:id`, `DELETE /api/firewall/:id`
- [ ] Prisma schema: Add `Firewall` model with unique constraint on `[bridgeId, side]`
- [ ] Return-flow detection: `?newFirewallId=...` auto-adds to palette
- [ ] Palette highlight animation on new firewall (2.5s)
- [ ] E2E tests: full workflow (Canvas → Builder → Save → Canvas with highlight)
- [ ] All tests passing (web + API integration)

## Files Changed (Layers 1 & 4)

**Layer 1 (Canvas Styling)**:
- **web/src/assembly.js**: Added firewall slot CSS (static red styling, hover effects)
- **web/src/assembly/firewall.js**: Firewall slot DOM factory function

**Layer 4 (Builder Page)**:
- **web/firewall-builder/builder.html**: Form UI with gradient background, centered card, clean styling
- **web/firewall-builder/builder.js**: Form logic, validation, API integration, error handling
- **web/src/firewallBuilderApi.js**: API wrapper with CRUD methods

**Tests**:
- **web/tests/assembly/firewall.static-red.test.js**: 8 DOM rendering tests (Layer 1)
- **web/tests/firewall-builder.test.js**: 25 validation and integration tests (Layer 4)

**Commits**:
1. `feat(phase-33): implement static red styling for required firewall slots`
2. `feat(phase-33): implement Layer 4 firewall builder page`

## Next Steps (In Order)

1. **Implement API endpoints** (`api/handlers/firewall.js`, Prisma schema update)
2. **Canvas integration**: Update `BRIDGE_SLOT_CONFIG`, render firewall slots in bridge view
3. **Return-flow logic**: Detect `?newFirewallId=...`, auto-add to palette, highlight
4. **E2E tests**: Full workflow (Canvas → Builder → Save → Canvas with highlight)
5. **Documentation & code review**: Update README, API docs, test coverage

## Technical Notes

### DOM Structure
Each firewall slot is a `<div class="firewall-slot firewall--required|firewall--filled">` containing:
- `.firewall-icon` (🛡️ shield emoji)
- `.firewall-status` (🔴 or 🟢 status dot)
- `.firewall-label` ("Source Firewall" / "Dest Firewall")
- `.firewall-missing` (hidden until 5s hover, displays "Required")

### Styling Strategy
- Base `.firewall-slot` has default grey border (#d1d5db)
- `.firewall--required` overrides with red dashed border (#ef4444) + light red background
- `.firewall--filled` uses grey border + light grey background
- Hover states smooth-transition (120ms) border color and box shadow
- No animations to keep UI clean and professional

### Accessibility
- `role="button"` for semantic meaning
- `tabindex="0"` for keyboard navigation
- `title` attribute for tooltip fallback
- Keyboard support: Enter and Space keys trigger click handler
- Hidden `.firewall-missing` indicator uses `aria-hidden="true"` (decorative)

## Risk Mitigation

### Risk: Users Confused by Separate Forms
**Mitigation**: Clear tooltip guidance ("Add firewall configuration to enable secure connection") + visual red indicator + highlighted navigation flow in Layer 4 builder

### Risk: Form Validation Errors
**Mitigation**: Client-side validation (IP format, port range) before API call; server-side validation enforces constraints; clear error messages

### Risk: Palette Duplication (like TP issue in Phase 32)
**Mitigation**: Track firewall IDs in store, deduplicate on return-flow like we did for TPs

### Risk: Permission/Tenancy Boundary Violations
**Mitigation**: API enforces org scoping; Prisma schema ties Firewall to Bridge to Organization; RLS at DB level

## Performance Considerations

- **DOM rendering**: Firewall slots are small, static elements (no heavy SVG or animation)
- **API calls**: Single POST to create, GET to fetch (no polling or streams)
- **Styling**: Pure CSS, no JavaScript-driven animations
- **Palette update**: Minimal — just add firewall object to store array and highlight 2.5s

## Phase 33 Timeline (Estimate)

- **Layer 1 (Canvas UI)**: ✅ Complete (2-3 hours)
- **Layer 4 (Builder + API)**: 4-5 hours
- **Canvas integration + return-flow**: 2-3 hours
- **E2E tests + refinement**: 2-3 hours
- **Total**: ~10-14 hours (assuming no major blockers)

## Status Dashboard

| Component | Status | Notes |
|-----------|--------|-------|
| Static red styling (CSS) | ✅ Complete | Assembly.js, firewall.js, 8 tests passing |
| 5s hover tooltip | ✅ Complete | Message: "Add firewall configuration to enable secure connection" |
| Canvas DOM rendering | ✅ Complete | firewall.js factory, accessibility verified |
| Layer 4 builder page | ✅ Complete | HTML form, CSS styling, JS validation/API integration |
| Form validation | ✅ Complete | IP (IPv4/IPv6), ports (single/ranges), protocol (TCP/UDP/BOTH) |
| Error handling | ✅ Complete | Inline validation errors, API error banner, dismissible |
| Loading states | ✅ Complete | Form hidden, spinner visible, buttons disabled during save |
| Builder tests | ✅ Complete | 25 tests (validation, DOM, integration, loading states) |
| API wrapper | ✅ Complete | saveFirewall, getFirewall, getFirewallsForBridge, deleteFirewall |
| All web tests | ✅ Complete | 112/112 passing (39 test files) |
| API endpoints | ⏳ Pending | POST, GET, DELETE firewall configs in api/handlers/ |
| Prisma schema | ⏳ Pending | Firewall model with unique [bridgeId, side] constraint |
| Canvas integration | ⏳ Pending | Render firewall slots in BRIDGE_SLOT_CONFIG |
| Return-flow logic | ⏳ Pending | Detect ?newFirewallId, auto-add to palette |
| Palette highlight | ⏳ Pending | 2.5s animation on new firewall |
| E2E tests | ⏳ Pending | Full workflow Canvas → Builder → Save → Canvas |

---

## References
- [Phase 32 Summary](./phase-32-summary.md) — Canvas assembly foundation
- [Phase 31 Plan](./phase-31-plan.md) — Blueprint data model
- [ARCHITECTURE.md](../../ARCHITECTURE.md) — 5-layer conceptual model
- [docs/blueprints/](../../blueprints/) — Blueprint integration specs
