> [!WARNING]
> Status: Planned / In Development
> Context: Original BF-INTEGRATION Vision (Pre-Phase 30)
# Phase 12B — Control Panel Navigation System (Layer-Based Menus)

**Status:** 🚧 IN PROGRESS
**Owner:** Frontend (Navigation UI) / UX
**Timeline:** Week 1 (Dec 23-27, 2025)

---

## Overview
Phase 12B delivers a unified Control Panel Navigation System to make platform features discoverable by layer. The system is componentized, permission-aware, and responsive, and is designed to work alongside Phase 12A (Layer 3 Enterprise Features).

---

## Main Menu Structure (Proposed)

BridgeFlow Control Panel
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

LAYER 1: INTEGRATION CANVAS
[ New Integration ]    [ Canvas Dashboard ]

LAYER 2: BRIDGE MANAGEMENT
[ Create Bridge ]     [ Bridge Dashboard ]

LAYER 3: DATA MAPPING
[ New Mapping ]       [ Mapping Dashboard ]

LAYER 4: PLATFORM CORE
[ My Organization ]   [ Team Settings ]   [ Billing ]

LAYER 5: ANALYTICS
[ Analytics Dashboard ] [ Reports ]

---

## Layer Dashboard Design (pattern)
Each layer/dashboard follows the same pattern — a centered grid of rectangular feature buttons (primary actions first, secondary actions below).

Example: Data Mapping Dashboard

[ Data Mapping Dashboard ]
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
[ Create New Mapping ]
[ Mapping Templates ]
[ Version History ]
[ Validation Rules ]
[ Test Mappings ]
[ Export / Import ]

---

## Visual Specifications
- Button dimensions: 1.5" × 0.5" → CSS: width: 144px; height: 48px; (96 DPI reference)
- Spacing: consistent margin of 16px between buttons (adjustable)
- Layout: centered grid, wrap into rows of 2–3 based on width
- Typography: bold label, 14px, center-aligned
- Icons: optional small (16px) SVG icon left of label
- Color: layer-based accent color per layer (optional)

CSS snippet (starter):

```css
.control-panel {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(144px, 1fr));
  gap: 16px;
  justify-items: center; /* center buttons */
}
.control-button {
  width: 144px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 6px;
  background: var(--button-bg, #0b5fff);
  color: #fff;
  font-weight: 600;
  gap: 8px;
}
@media (max-width: 600px) {
  .control-button { width: 120px; height: 44px; font-size: 13px; }
}
```

---

## Component & Implementation Plan
- Create a reusable `ControlPanel` component that accepts `sections: Array<{ title, features: Feature[] }>`
- `Feature` shape: `{ id, label, route, icon?, requiredPermission? }
- Create `ControlButton` component with exact dimension styles and optional icon
- Navigation service/router mapping: `layer -> route` with breadcrumbs
- Permission service: hides or disables buttons if user lacks permission
- Persist last-visited dashboard per user (localStorage or user preference endpoint)
- Accessibility: focus outlines, ARIA labels, keyboard navigation, high contrast mode

### Implementation Tasks (Week 1)
1. Component scaffold: `ControlPanel`, `ControlButton` (React/Vanilla JS as per project stack)
2. Build main menu page: `/control-panel`
3. Implement Layer dashboards: `/control-panel/layer-3` etc. (skeletons)
4. Wire up navigation service to existing routes
5. Implement permission checks and sample roles
6. Add icons & color palette (design review)
7. Add tests: unit tests for components + e2e for navigation flows

---

## Questions for Product (decisions)
- Color coding: Should each layer have a consistent accent color? (Suggested: yes — improves scannability)
- Icons: Add small icons to each button? (Suggested: yes — consistent icon set)
- Responsive: Should this be mobile-capable or desktop-first? (Suggested: responsive with graceful degradation)
- Default view after login: Show Main Menu or last visited dashboard? (Suggested: last visited dashboard preferred for power users, main menu for first-time users)

---

## Acceptance Criteria ✅
- [ ] `ControlPanel` component implemented and styled to spec
- [ ] Main menu page shows all Layers with correct grouping
- [ ] Layer dashboards created with at least two sample buttons each
- [ ] Permission-aware rendering hides unauthorized features
- [ ] Unit & e2e tests for navigation flow
- [ ] Accessibility checks pass (keyboard, screenreader labels)
- [ ] Responsive behavior verified on 320px–1440px widths

---

## Notes
- Priority: Can be built in parallel with Phase 12A (Data Mapping). Recommended to start navigation scaffolding immediately to aid discoverability for the new enterprise features.
- We can iterate on visual polish after the first functional pass.

---

**Next step:** Implement `ControlPanel` scaffold and wire two layer dashboards (Layer 3 + Layer 4) as a proof of concept.

