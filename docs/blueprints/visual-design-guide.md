# 🌉 Bridge Blueprint Visual Design Guide

## Overview

Bridge Blueprints now use a **spatial metaphor** that mirrors real-world integration architecture: Trading Partners as external foundations at the edges, Adapters (transformers) nested internally, and Connectors spanning the bridge. This design provides clear visual hierarchy and guides users through the integration assembly process.

## 🎨 Visual Metaphor

### The Spatial Bridge Model

**Jan 2026 Update**: New layout reflects the true architectural model:

```
┌─────────────────────────────────────────────────────┐
│                    BRIDGE CANVAS                     │
│                                                     │
│  ┌──────────┐   ┌──────────┐   ┌──────────┐       │
│  │  SOURCE  │   │ ADAPTER  │   │  DEST    │       │
│  │   TP     │◄──┤(Internal)├──►│   TP     │       │
│  │  🏢      │   │  ⚙️      │   │  📦      │       │
│  └──────────┘   └──────────┘   └──────────┘       │
│       │          CONNECTOR          │               │
│       └──────────[🔌 SECURE]────────┘               │
│                                                     │
└─────────────────────────────────────────────────────┘
```

**Key Layout:**
- **Left Edge**: Source Trading Partner (external system)
- **Behind Left TP**: Source Adapter (transforms internal → external)
- **Center Span**: Connector/Bridge (secure transport)
- **Behind Right TP**: Destination Adapter (transforms external → internal)
- **Right Edge**: Destination Trading Partner (external partner)

**Visual Logic:**
- TPs are the *foundations* — at the edges, solid orange blocks
- Adapters are *internal transformers* — nested behind TPs, green slots (z-index behind)
- Connector is the *bridge span* — connects across middle, blue slot
- No center element — the bridge IS the integration, not something separate

## 🎯 Slot Types & Positioning

### Trading Partner Blocks (Source & Destination)
- **Type**: `'source-tp'`, `'dest-tp'`
- **Position**: Left (x:80, y:220), Right (x:720, y:220)
- **Dimensions**: 80w × 100h
- **Border**: 2px solid `#F97316` (orange)
- **Background**: White, shadow for depth
- **Icon**: 🏢
- **Label**: "Source System" / "Destination"
- **Required**: ✅ Both mandatory
- **Meaning**: External partner systems

### Adapter Slots (Internal Transformers)
- **Type**: `'source-adapter'`, `'dest-adapter'`
- **Position**: Behind left TP (x:20, y:240), Behind right TP (x:820, y:240)
- **Dimensions**: 60w × 40h
- **Border**: 2px dashed `#10B981` (green)
- **Background**: White, nested positioning
- **Icon**: ⚙️
- **Label**: "Data Transformer"
- **Required**: First is required, second is optional
- **Meaning**: Internal data transformation (X12→JSON, CSV→XML, etc.)

### Connector Slot (Bridge Span)
- **Type**: `'bridge-connector'`
- **Position**: Center (x:180, y:250)
- **Dimensions**: 500w × 24h (horizontal bar)
- **Border**: 2px dashed `#3B82F6` (blue)
- **Background**: White, minimal height for span effect
- **Icon**: 🔌
- **Label**: "Connection"
- **Required**: ✅ Mandatory
- **Meaning**: Transport mechanism (AS2, SFTP, HTTP, etc.)

## 🎨 Slot States & Styling

### Unfilled (Required) - Pulsing
```css
.tp-block.slot--required,
.adapter-slot.slot--required,
.connector-slot.slot--required {
  animation: bridge-pulse 2s infinite;
  border: 2px dashed; /* Orange, Green, or Blue */
}

@keyframes bridge-pulse {
  0% { box-shadow: 0 0 0 0 rgba(249, 115, 22, 0.4); }
  70% { box-shadow: 0 0 0 8px rgba(249, 115, 22, 0); }
  100% { box-shadow: 0 0 0 0 rgba(249, 115, 22, 0); }
}
```

### Unfilled (Optional) - Static
```css
.adapter-slot:not(.slot--required) {
  border-color: #D1D5DB;
  animation: none;
  opacity: 0.7;
}
```

### Filled (Configured)
```css
.slot--filled {
  border-style: solid;
  background: #F8FAFC;
  animation: none;
}
```

## ♿ Accessibility Features

### ARIA Labels & Semantic HTML
```html
<div class="tp-block"
     data-slot-key="source-tp"
     aria-label="Add Source System - External trading partner - Required"
     role="button"
     tabindex="0">
  <div class="slot-icon">🏢</div>
  <div class="slot-label">Source System</div>
</div>
```

### Keyboard Navigation
- `Tab` / `Shift+Tab`: Navigate through slots
- `Enter` / `Space`: Activate slot → open gap-filling modal
- Visible focus rings on all interactive elements
- High contrast: 4.5:1+ WCAG AA compliant

## � Responsive Layout (Phase 32.8)

### Breakpoint Strategy

**Desktop (>1024px): Percentage-Based**
```css
/* Source TP: left edge */
left: 5%;        width: 12%;     minWidth: 80px;

/* Connector: center span */
left: 18%;       width: 64%;     minWidth: 300px;

/* Dest TP: right edge */
right: 5%;       width: 12%;     minWidth: 80px;
```
→ Adapts to window width, maintains proportions

**Tablet (768–1024px): Compact Fixed**
```css
width: 70px;  height: 90px;  /* Smaller than desktop */
```
→ Fixed pixels, all slots still visible, tighter spacing

**Mobile (<640px): Vertical Stack**
```css
position: relative !important;
margin: 10px auto;
width: 90% !important;
```
→ One slot per row, centered, staggered layout

### Drag-and-Drop Feedback (Phase 32.8)

When dragging a palette item over a slot:

```css
.slot-drag-over {
  background: rgba(249, 115, 22, 0.15);
  border-color: #F97316;
  box-shadow: 0 0 12px rgba(249, 115, 22, 0.3);
  transform: scale(1.05);
}
```

**Type Validation:**
- Each slot declares `acceptTypes`: `['trading-partner']`, `['adapter']`, etc.
- Dragged component type checked against slot acceptance
- ✅ Compatible → snap to slot
- ❌ Incompatible → warning toast, no snap

### Implementation Details

**[setupResponsiveLayoutObserver()](web/src/assembly.js#L1875+)**
- Monitors window resize, detects >1024px threshold crossing
- Re-renders bridge outline when crossing breakpoint
- Debounced (300ms) to prevent excessive renders

**[createBridgeSlot() Positioning](web/src/assembly.js#L900+)**
```javascript
const useResponsive = window.innerWidth > 1024;
if (useResponsive && config.responsive) {
  // Apply percentage-based from config.responsive
  el.style.left = config.responsive.left;
  el.style.width = config.responsive.width;
  // ...
} else {
  // Fallback to fixed pixels from config.position
  el.style.left = config.position.x + 'px';
}
```

**[BRIDGE_SLOT_CONFIG Structure](web/src/assembly.js#L89+)**
Each slot now includes both positioning modes:
```javascript
{
  type: 'tradingPartner',
  position: { x: 80, y: 220, width: 80, height: 100 },  // Fixed
  responsive: { left: '5%', width: '12%', ... },         // Percentage
  acceptTypes: ['trading-partner']                        // Drop validation
}
```

---

## 🔄 User Interaction Flow

### 1. Blueprint Selection & Responsive Render
```
User selects "Retail Brand" blueprint
↓
Canvas detects screen width & renders:
  • Desktop (>1024px):   Percentage-based, full layout
  • Tablet (768–1024px): Compact fixed, all visible
  • Mobile (<640px):     Vertical stack
↓
  • Source TP block (left, orange, pulsing)
  • Source Adapter slot (behind left, green, pulsing)
  • Connector span (center, blue, pulsing)
  • Dest TP block (right, orange, pulsing)
  • Dest Adapter slot (behind right, gray, static)
```

### 2. Drag-and-Drop Configuration (NEW Phase 32.8)
```
User drags "Company CRM" from palette → "Source System" slot
↓
On dragover: Slot feedback
  • Background: Orange tint
  • Border: Glows orange
  • Scale: 1.05x
  • Message: "Drop here!" (visual feedback)
↓
On drop:
  • Validate: Is 'trading-partner' in slot's acceptTypes?
  • ✅ Yes → Snap to slot, animate back
  • ❌ No → Warning toast, no snap
↓
Result: Slot configured, no longer pulses
  Toast: "✅ Source System configured: Company CRM"
```

### 3. Gap Filling (Click Fallback)
```
User clicks "Source System" (if didn't drag-drop)
↓
Opens gap-filling modal:
  Title: "Configure Source System"
  Hint: "Your internal system"
  Options: [Select Trading Partner from list]
↓
User selects existing TP or creates new
↓
Slot fills (border→solid, stops pulsing)
```

### 4. Progress Visualization
```
Empty → Pulsing (orange)
    ↓
(Drag-drop OR click modal)
    ↓
Selection → Slot fills (solid background)
    ↓
All filled → "Ready to Activate Bridge" button enabled
```

## 🎨 Design Principles

### Architecture as Visual Grammar
1. **Edges = External** (TPs in orange at edges)
2. **Interior = Internal** (Adapters nested behind TPs)
3. **Span = Transport** (Connector crossing middle)
4. **No Center Element** (Bridge IS the connection, not a separate transform layer)

### Color Semantics (Fixed)
- 🟠 **Orange (#F97316)**: Trading Partners (required, external)
- 💚 **Green (#10B981)**: Adapters (required/optional, internal)
- 🔵 **Blue (#3B82F6)**: Connectors (required, transport)
- ⚪ **Gray (#D1D5DB)**: Optional/secondary slots
- 🤍 **White**: Backgrounds, clean canvas

### Animation Language
- **Pulse**: Required slots draw attention without distraction
- **Duration**: 2s cycle (slow, professional)
- **Easing**: Box-shadow expand (smooth)
- **Stops on Fill**: Slot animates until configured

### Spacing & Proportions
- TPs: 80×100 (large, prominent)
- Adapters: 60×40 (compact, secondary)
- Connector: 500×24 (wide, thin spanning line)
- Gaps: ~100px between edges and center (breathing room)

## 📱 Responsive Considerations (Phase 32.8+)

### Current (Phase 32): Fixed Layout
```css
position: absolute;
left: [fixed px];
top: [fixed px];
width: [fixed px];
height: [fixed px];
```

### Future (Phase 32.8): Responsive Layout
```css
/* Percentage-based or flex-based positioning */
position: absolute;
left: 5%;        /* Source TP */
width: 12%;      /* Responsive width */
right: 5%;       /* Dest TP */
/* Adapter positions relative to TPs */
/* Connector scales with container */
```

### Mobile Adaptation (Phase 33+)
- Stack TPs vertically on mobile
- Rotate connector 90° for vertical flow
- Larger touch targets (48px minimum)
- Maintained visual hierarchy

## 🚀 Implementation Details

### Core Functions

**[injectBridgeStyles()](web/src/assembly.js#L21-L87)**
- Creates `<style>` tag once (idempotent)
- Defines all slot classes: `.tp-block`, `.adapter-slot`, `.connector-slot`
- Includes pulse animation and fill states
- Sets to `bridgeStylesInjected = true` (prevents duplicates)

**[BRIDGE_SLOT_CONFIG](web/src/assembly.js#L89-L131)**
- Centralized metadata: type, label, hint, required, position, className
- Easy to extend: add Firewall, Policy, or Data Map slots
- Position format: `{ x, y, width, height }` (px, future: percentage)

**[renderBridgeOutline(template, workspaceOverride)](web/src/assembly.js#L813-L836)**
- Clears old markup
- Creates `.bridge-canvas` container
- Iterates `BRIDGE_SLOT_CONFIG`, renders each slot
- Reads `template.config.slots` for pre-filled state

**[createBridgeSlot(slotKey, config, isFilled, blueprintId)](web/src/assembly.js#L838-L870)**
- Builds individual slot DOM element
- Applies classes: `[config.className]` + optional `slot--filled`/`slot--required`
- Positions absolutely from config
- Attaches click handler → `triggerBridgeSlotConfiguration()`

**[triggerBridgeSlotConfiguration(slotConfig)](web/src/assembly.js#L872-L904)**
- Receives full slot metadata (type, label, hint, required, position, etc.)
- Creates ghost component with slot context
- Calls `triggerGapFilling()` → opens modal

### Integration Points

| Function | Purpose |
|----------|---------|
| `loadBlueprintToCanvas(template)` | Entry point: Load blueprint → render outline |
| `window.loadBlueprintToCanvas` | Exported for blueprint gallery modal |
| `renderBridgeOutline()` | Main render (new spatial model) |
| `createBridgeSlot()` | Slot factory |
| `triggerBridgeSlotConfiguration()` | Gap filling entry point |
| `triggerGapFilling(ghostComp)` | Modal dispatcher (existing) |

## 🎯 Success Metrics

### User Experience
- ✅ **Instant clarity**: Bridge spatial layout immediately communicates architecture
- ✅ **Reduced clicks**: Fewer modals/steps to understand flow
- ✅ **Guided flow**: Pulsing slots show what to configure next
- ✅ **Professional UX**: Enterprise-grade visual polish

### Business Value
- ✅ **Faster onboarding**: New users understand TPs/Adapters/Connectors
- ✅ **Higher completion**: Clear progress from empty → filled
- ✅ **Extensibility**: Easy to add Firewall/Policy slots
- ✅ **Competitive edge**: Unique bridge metaphor differentiates BridgeFlow

## 🔮 Roadmap

### Phase 32 (Core Spatial Model) ✅
- ✅ Spatial layout (TP edges, adapters nested, connector span)
- ✅ Slot metadata & configuration
- ✅ Gap-filling modal integration
- ✅ Idempotent style injection
- ✅ Centralized BRIDGE_SLOT_CONFIG

### Phase 32.8 (Responsive + Drag-and-Drop) 🔨 IN PROGRESS
- ✅ Percentage-based positioning (responsive breakpoints)
- ✅ Window resize observer (re-render on threshold crossing)
- ✅ Drag-and-drop palette → slot snapping
- ✅ Type validation (acceptTypes per slot)
- ✅ Drag-over visual feedback (.slot-drag-over)
- 📋 Live status indicators (healthy/warning — defer to Phase 33)
- 📋 Mobile stack layout polish (Phase 33+)

### Phase 33 (Expansion + Polish)
- 📋 Firewall slot (security policies)
- 📋 Data Map slot (field transformation)
- 📋 Multi-hop bridges (chained adapters)
- 📋 Slot persistence (save filled slots to localStorage)
- 📋 Mobile layout optimization
- 📋 Animated transitions (slot fill, adapter reveal)

### Phase 39 — Canvas UX Polish ✅
- ✅ Professional color scheme, non-overlapping positioning, visual hierarchy
- ✅ **Red outlines** for required elements (static, non-blinking) for clear guidance
- ✅ Protocol badges (AS2, SFTP, API, Database) and status bar with connection health and protocol visibility
- ✅ Placement guides, dotted drop indicators, and improved empty-state guidance ("Start Building Your Bridge")
- ✅ TP duplication fix via `MutationObserver` with initial cleanup on page load and runtime auto-removal
- ✅ Undo/Redo/Save/Deploy toolbar and keyboard shortcuts (Ctrl+Z/Ctrl+Y/Ctrl+S)
- ✅ Robust state stack management for reliable undo/redo of complex edits
- ✅ 5-second hover tooltips with component & protocol details, auto-dismissed after timeout
- ✅ Unit tests: `web/tests/canvas-ux.test.js`
---

*The bridge spatial model is more than aesthetics — it's visual architecture. TPs at edges, adapters nested, connector spanning. This is how users understand integration.* 🌉✨



