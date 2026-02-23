# 🚀 Welcome to BridgeFlow - Developer Onboarding

**Current Product Version**: Phase 8 (Enhanced Visual Components)
**Last Updated**: December 21, 2025

## 1. Project Overview
BridgeFlow is an integration platform designed to make connecting APIs, Webhooks, and EDI systems accessible to non-technical users. We are currently transitioning from a form-based configuration model to a fully interactive **Visual Bridge Builder**.

### Key Value Proposition
*   **Visual**: Drag-and-drop canvas to connect Trading Partners and Resources.
*   **Real-time**: Animated data flow visualization.
*   **Hybrid**: Supports both simple Webhook->API bridges and complex EDI workflows.

---

## 2. Architecture & Tech Stack

We use a **Lightweight, Standards-Based** stack. No heavy frameworks (React/Vue/Angular) are strictly enforced in the core builder to maintain raw performance and control over the canvas, though we use ESM modules extensively.

*   **Frontend**: Vanilla JavaScript (ES Modules), CSS Variables, HTML5.
*   **State Management**: Centralized Pub/Sub Store (`src/state/store.js`).
*   **Persistence**: Dual-layer (LocalStorage for draft/offline, API for production).
*   **Styling**: Modular CSS (`canvas-builder.css`, `uikit.css`) + Utility classes.

### 🏠 Key Directories (`c:\JS\bridgeflow\web\`)
*   `src/bridge-builder.ui.js`: **The Core**. Logic for Drag-and-drop, Slots, SVG connectors, and the Details Panel.
*   `src/state/store.js`: **The Brain**. Singleton class managing Bridges, Partners, and Resources.
*   `src/canvas-controller.js`: The main entry point for the Canvas page.
*   `src/bridges.js`: The Dashboard logic (Bridge Manager).
*   `css/modules/`: Component-specific styles (keep it modular!).

---

## 3. The "Visual Builder" (Phase 8)

We just completed **Phase 8**, which introduced the full-screen visual editor.

### How it Works (Under the Hood)
1.  **Slots**: We use a 3-slot model: `Source` -> `Connection Logic` -> `Destination`.
2.  **SVG Connectors**: Dynamic SVG paths draw lines between slots. They accept CSS classes like `.active` to trigger flow animations.
3.  **Data Model**:
    *   **Legacy Bridges**: Stored as simple objects `{ url, method, ... }`.
    *   **Visual Bridges**: Stored with `type: 'visual-builder'` and a `config.slots` object containing the visual state.
    *   **Persistence**: The `store.js` handles saving both types transparently.

### Key Files for the Builder
*   **UI Logic**: `web/src/bridge-builder.ui.js`
*   **Styles**: `web/css/modules/canvas-builder.css`

---

## 4. Development Workflow

### Getting Started
1.  **Serve** the `web/` directory (e.g., via `live-server` or `python -m http.server`).
2.  **Navigate** to `http://localhost:8080/canvas-legacy.html` to see the Builder (legacy). The original `canvas-visual.html` has been archived at `archive/canvas-visual.html`.
3.  **Navigate** to `http://localhost:8080/bridges.html` to see the Bridge Manager.

### Common Tasks
*   **Adding a new Component Type**: Update `bridge-builder.ui.js` `renderSlot` logic.
*   **Modifying State**: Add methods to `BridgeFlowStore` (`store.js`) and emit events.
*   **Styling**: Add new modules to `css/modules/` and import in the HTML.

---

## 5. Current Status & Next Steps

### ✅ Completed (Phase 8)
*   Full-screen Expandable Canvas.
*   Interactive Data Flow Animations.
*   Component Details Panel (Side-bar configuration).
*   Unified Bridge Manager (Dashboard).

### 🚧 Upcoming (Phase 9 - Advanced Components)
*   **Real Transformation Engine**: Actually executing the JS code written in the details panel.
*   **Security Layer**: API Key rotation and OAuth flows in the visual builder.
*   **Monitoring Hub**: Live traffic graphs overlaying the visual connections.

---

## 6. Resources
*   **Task Board**: `docs/task-lists/TASK-LIST-2.md`
*   **Product Phases**: `docs/phases/readme.md`
*   **Recent Walkthrough**: `brain/walkthrough.md` (Check the artifacts folder)

*Welcome to the team! If you see a `TODO` in the code, it's mostly likely waiting for Phase 9.*
