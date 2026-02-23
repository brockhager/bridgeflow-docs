# Blueprints: Canvas Integration

The Bridge Canvas (`/canvas-assembly`) is the primary interface for consuming Blueprints.

## Architecture

The integration consists of three key phases:

1.  **Catalog Selection** (`gallery.js`)
2.  **Bridge Outline Visualization** (`assembly.js`)
3.  **Gap-Filling & Configuration** (`assembly.js`)
4.  **Deployment** (`deployBridge.js`)

### 1. Dynamic Catalog (`gallery.js`)
- **Source**: Fetches from `GET /api/blueprints`.
- **UI**: Displayed as a modal overlay over the canvas.
- **Selection**: User clicks "Select", which loads the blueprint template into the assembly engine.

### 2. Bridge Outline Visualization (`assembly.js`)
- **New in Phase 32**: Blueprints render as interactive bridge skeleton instead of component tiles
- **Function**: `renderBridgeOutline()` creates visual metaphor of incomplete integration
- **Slots**: Interactive circles positioned at key integration points (source, transform, destination)
- **Visual States**:
  - Required slots: Orange dashed circles with pulse animation
  - Optional slots: Gray dashed circles (static)
  - Filled slots: Solid borders with component icons

### 3. Gap-Filling Workflow (`assembly.js`)
- **Bridge Slots**: Click orange/gray circles to open configuration modals
- **Component Creation**: Configured resources replace empty slots in the bridge outline
- **Visual Progress**: Bridge appears to "build" as slots are filled
- **State Management**: Tracks which bridge positions are configured

### 4. Deployment (`deployBridge.js`)
- **Trigger**: "Activate Bridge" button.
- **Validation**: Checks that all required bridge slots are filled
- **Action**:
  - Serializes the configured bridge components
  - Calls `POST /api/bridges/:id/activate` with UserBridge data
  - Backend provisions the integration package

## 🌉 Bridge Outline Implementation

### Rendering Function
```javascript
renderBridgeOutline(template) {
  // Creates SVG bridge skeleton
  // Positions interactive slots at key points
  // Maps blueprint.required to slot colors
}
```

### Slot Configuration
```javascript
const slotMappings = [
  { type: 'source', label: 'Source System', required: true },
  { type: 'transform', label: 'Data Transform', required: false },
  { type: 'destination', label: 'Destination', required: true }
];
```

### Interactive Elements
- **Click handlers**: `triggerBridgeSlotConfiguration()`
- **Hover effects**: Scale and background color transitions
- **Accessibility**: ARIA labels, keyboard navigation, high contrast

## 🔄 Updated User Workflow

### Traditional (Phase 31)
1. Load blueprint → Ghost component tiles appear
2. Click ghost tiles → Configure each component
3. Validate → Deploy bridge

### Bridge Outline (Phase 32+)
1. Load blueprint → Interactive bridge skeleton appears
2. Click orange/gray slots → Configure required/optional components
3. Bridge visually "builds" as slots are filled
4. Validate → Deploy bridge

## 🎨 UX Improvements

### Visual Clarity
- **Before**: Static tiles felt "complete" even when empty
- **After**: Empty bridge outline clearly shows "needs configuration"

### Spatial Understanding
- **Before**: Linear list of components
- **After**: Spatial layout matches data flow direction

### Progress Visualization
- **Before**: Badge-based status indicators
- **After**: Bridge visually "constructs" as configured

## 🛠 Technical Implementation

### Key Functions
- `renderBridgeOutline(template)` - Main rendering function
- `triggerBridgeSlotConfiguration(slotType, isRequired, blueprint)` - Gap filling logic
- `loadBlueprintToCanvas(template)` - Entry point from gallery

### CSS Classes
- `.bridge-outline` - Container for bridge SVG
- `.bridge-slot` - Interactive slot (required)
- `.bridge-slot.optional` - Interactive slot (optional)

### Data Flow
1. Blueprint selection → `loadBlueprintToCanvas()`
2. `renderBridgeOutline()` → Creates visual skeleton
3. Slot click → `triggerBridgeSlotConfiguration()`
4. Component configuration → Updates bridge visualization
5. All slots filled → Bridge ready for deployment

## 📱 Frontend Components

### Files Modified
- `web/src/assembly.js` - Main canvas logic
- `web/src/features/canvas-assembly/blueprints/gallery.js` - Blueprint catalog
- `web/test-bridge-outline.html` - Visual test page

### Browser Compatibility
- Modern browsers (Chrome 90+, Firefox 88+, Safari 14+)
- SVG rendering support required
- CSS animations and transitions

## 🔧 Backend Integration

### API Endpoints
- `GET /api/blueprints` - Fetch available blueprints
- `POST /api/bridges/:id/activate` - Deploy configured bridge

### Data Model
- Blueprint `required` array determines slot colors
- Component mapping to bridge positions
- Gap-filling modal integration

---

*The bridge outline visualization transforms blueprint selection from a technical task into an intuitive visual building process, reinforcing BridgeFlow's core metaphor: building integration bridges.* 🌉
