# Phase 32 — Bridge Canvas & Blueprints

**Planned:** January 2026  
**Effort:** 3-4 days  
**Priority:** High (user experience foundation)

## 🎯 Strategic Context

Phase 32 is the central user experience of BridgeFlow — a visual, guided environment where customers assemble their integration bridge using pre-defined blueprints and real-time gap detection.

**🔑 Key Insight:** This is not just a UI — it's the orchestration layer that ties together all previous phases (Orgs, Tenets, Connectors, Adapters, Packages) into a cohesive, user-driven workflow.

**📍 Location:** Built within existing `canvas-assembly` structure, not as a separate section.

---

## 🎯 Phase 32 Core Objective

Enable users to:

1. **Select a blueprint** (e.g., "Healthcare Payer", "Retail Supplier")
2. **Visually assemble** their bridge on a canvas
3. **Receive real-time guidance** for missing pieces
4. **Deploy a complete, working integration** in minutes

All while hiding complexity for non-technical users and exposing depth for admins.

---

## 📋 Phase 32 Deliverables (4/4)

### ✅ 1. Bridge Blueprint System
**Predefined Templates**: Industry-specific integration patterns
- **healthcare-payer**: Receive 837s, send 997s
- **retail-brand**: Send 850s, receive 810s
- **logistics-carrier**: Receive 210s, send 990s

**Blueprint Metadata Structure**:
```typescript
{
  id: "healthcare-payer",
  name: "Healthcare Payer",
  description: "Receive claims from providers, send acknowledgments",
  requiredComponents: ["as2-connector", "x12-837-tenet", "provider-tp"],
  optionalComponents: ["sftp-backup", "database-adapter"],
  category: "healthcare",
  difficulty: "intermediate",
  estimatedTime: "30 minutes"
}
```

### ✅ 2. Interactive Bridge Canvas (Within canvas-assembly)
**Visual Editor**: Drag-and-drop interface for bridge assembly
- **Bridge Outline**: Shows required vs optional segments
- **Component Palette**: Organizations, Trading Partners, Connectors, Adapters, Tenets
- **Real-Time Validation**: Color-coded completion status

**Status Indicators**:
- ✅ **Green** = Complete and configured
- ⚠️ **Yellow** = Missing optional components
- ❌ **Red** = Missing required components

### ✅ 3. Gap Detection & Guidance Engine
**Auto-Analysis**: When user selects blueprint, canvas highlights gaps
- "You need an AS2 Connector for inbound 837s"
- "Add Provider Trading Partner to receive from"
- "Configure HIPAA Tenet for validation"

**Contextual Actions**:
- "+ Create AS2 Connector" → opens Connector form (Phase 30)
- "+ Add Trading Partner" → opens TP onboarding flow (Phase 31A)
- "+ Set Up Network" → opens Firewall guidance (Phase 33)

### ✅ 4. Deployment Workflow
**"Activate Bridge" Button**: One-click bridge deployment
- Validates all components
- Deploys adapters/connectors
- Generates tokens for TPs
- Sets up monitoring

**Status Dashboard**:
- Traffic flow visualization
- Error rates, success metrics
- "Bridge Health" score

---

## 🏗️ **Architecture: Evolution of canvas-assembly**

### **📍 Location Decision**
**Built within existing `canvas-assembly` structure:**
```
src/features/canvas-assembly/
├── bridge-canvas/               ← Main canvas UI (NEW)
│   ├── BridgeCanvas.jsx
│   ├── BridgeOutline.jsx
│   └── ComponentPalette.jsx
├── blueprints/                  ← Blueprint system (NEW)
│   ├── BlueprintGallery.jsx
│   └── blueprint-templates/     ← JSON definitions
├── components/                  ← Reusable component cards (NEW)
│   ├── TradingPartnerCard.jsx
│   ├── ConnectorCard.jsx
│   ├── AdapterCard.jsx
│   └── TenetCard.jsx
├── gap-detection/               ← Gap detection engine (NEW)
│   ├── GapDetector.jsx
│   └── GuidanceEngine.jsx
└── deployment/                  ← Bridge activation (NEW)
    ├── BridgeActivator.jsx
    └── StatusDashboard.jsx
```

### **🔗 Integration Benefits**
- **Route**: `/canvas-assembly` → loads BridgeCanvas
- **State**: Uses existing canvas-assembly Redux/Zustand context
- **Permissions**: Inherits org scoping and RBAC from canvas-assembly
- **Navigation**: Fits naturally after user selects org/tenet

### **🚫 Why Not a New Section?**
- **Fragmentation**: Users would jump between "assembly" and "bridge builder"
- **Duplication**: Rebuild auth, org context, navigation
- **Confusion**: "Is the canvas in canvas-assembly or elsewhere?"

---

## 🧱 **Core Components to Build**

### **A. Backend API**
```javascript
// Blueprint management
api/handlers/admin/blueprints.js    // CRUD for blueprints
api/handlers/admin/bridge-state.js  // Validate/activate bridge
api/routes/adminBridge.js           // /admin-api/blueprints, /bridge-state

// Blueprint definitions (static JSON or DB)
api/data/blueprints/
  ├── healthcare-payer.json
  ├── retail-brand.json
  └── logistics-carrier.json
```

### **B. Database Models**
```prisma
model BridgeBlueprint {
  id          String @id @default(cuid())
  name        String
  description String
  config      Json   // requiredComponents, optionalComponents
  category    String
  difficulty  String
  isActive    Boolean @default(true)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}

model UserBridge {
  id             String @id @default(cuid())
  organizationId String
  blueprintId    String
  name           String
  config         Json   // Component configurations
  status         String // draft, active, inactive, error
  createdAt      DateTime @default(now())
  updatedAt      DateTime @updatedAt
  
  organization Organization @relation(fields: [organizationId], references: [id])
  blueprint     BridgeBlueprint @relation(fields: [blueprintId], references: [id])
}

model BridgeComponent {
  id           String @id @default(cuid())
  userBridgeId String
  componentType String // connector, adapter, tenet, trading-partner
  componentId  String  // Reference to actual component
  config       Json    // Component-specific config
  status       String // required, optional, missing
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt
  
  userBridge UserBridge @relation(fields: [userBridgeId], references: [id])
}
```

### **C. Frontend Components**
```jsx
// Main canvas UI
src/pages/admin/
  └── BridgeCanvas.jsx        // Main canvas UI

// Blueprint system
src/features/canvas-assembly/blueprints/
  ├── BlueprintGallery.jsx     // Select blueprint
  └── blueprint-templates/     // JSON definitions
    ├── healthcare-payer.json
    ├── retail-brand.json
    └── logistics-carrier.json

// Canvas components
src/features/canvas-assembly/bridge-canvas/
  ├── BridgeCanvas.jsx        // Main canvas interface
  ├── BridgeOutline.jsx       // Required/optional segments
  ├── ComponentPalette.jsx    // Drag sources
  └── ComponentCard.jsx       // Configurable component tile

// Gap detection
src/features/canvas-assembly/gap-detection/
  ├── GapDetector.jsx         // Real-time validation
  └── GuidanceEngine.jsx      // Contextual actions

// Deployment
src/features/canvas-assembly/deployment/
  ├── BridgeActivator.jsx     // Bridge activation workflow
  └── StatusDashboard.jsx     // Post-deployment monitoring
```

---

## 🔌 **Integration Points (All Previous Phases)**

| Component | How It Appears in Canvas | Phase Integration |
|-----------|---------------------------|------------------|
| **Organization** | Auto-selected (current org) | Phase 29 |
| **Trading Partner** | "Add TP" card → triggers TP onboarding | Phase 31A |
| **Connector** | "AS2 Connector" tile → opens Phase 30 form | Phase 30 |
| **Adapter** | "Database Adapter" tile → opens Phase 31B form | Phase 31B |
| **Tenet** | "HIPAA Claims Tenet" tile → links to Tenet detail | Phase 28 |
| **Firewall** | "Network Setup" card → appears when adding Connector | Phase 33 |

---

## 🎨 **User Experience Flow**

### **Step 1: Blueprint Selection**
1. User lands on `/canvas-assembly`
2. Sees blueprint gallery → selects "Healthcare Payer"
3. Canvas loads with outline showing required/optional components

### **Step 2: Bridge Assembly**
1. **Required Components**: [AS2 Connector], [Provider TP], [HIPAA Tenet]
2. **Optional Components**: [SFTP Backup], [Claims DB Adapter]
3. User clicks "+ Add Provider TP" → Free TP onboarding flow starts (Phase 31A)
4. User adds AS2 Connector → Canvas shows "Network Setup" card (Phase 33)

### **Step 3: Gap Resolution**
1. Real-time validation shows completion status
2. Contextual guidance appears for missing components
3. Each component card opens the appropriate configuration form

### **Step 4: Bridge Activation**
1. All gaps filled → "Activate Bridge" enabled
2. Bridge goes live → Packages flow, dashboard updates
3. Status dashboard shows traffic flow and health metrics

---

## 🔐 **Security & Scoping**

### **Organization Scoping**
- All bridge state scoped to Organization
- Free TPs appear as "managed partners" (sponsored by org)
- Enterprise-only components hidden for free-tier users

### **Permission Model**
- **View Bridges**: `bridge:view` permission
- **Create Bridges**: `bridge:create` permission  
- **Activate Bridges**: `bridge:activate` permission
- **Manage Blueprints**: `blueprint:manage` permission (admin only)

### **Data Security**
- Bridge configurations encrypted at rest
- Component credentials isolated by organization
- Audit trail for all bridge modifications

---

## 🚀 **Phase 32 MVP Scope**

### **✅ Build Now**
1. **Blueprint System**: 3 templates (healthcare, retail, logistics)
2. **BridgeCanvas UI**: Drag-and-drop + gap detection
3. **Component Cards**: TP, Connector, Adapter, Tenet cards
4. **Bridge Activation**: Validation → deploy workflow
5. **Phase 31A/31B Integration**: Open adapter/connector forms

### **📋 Build Later**
1. **Custom Blueprints**: User-defined blueprint creation
2. **Advanced Analytics**: Bridge performance metrics
3. **Template Marketplace**: Community blueprints
4. **AI Recommendations**: Suggest components based on usage patterns

### **💡 Future Hook**
Firewall guidance (Phase 33) appears as a card in the canvas — build the hook now, implement details later.

---

## 🧪 **Success Criteria**

### **✅ Non-Technical User Can:**
- Select "Retail Brand" blueprint
- Add 1 Trading Partner (free tier)
- Create AS2 Connector
- See "Bridge Complete" ✅
- Activate → start receiving Packages

### **✅ CTO Can:**
- Manage all bridges across orgs
- Create custom blueprints
- Monitor bridge health and performance
- Troubleshoot bridge issues

### **✅ System Provides:**
- Real-time gap detection and guidance
- One-click bridge activation
- Visual representation of integration topology
- Seamless integration with all previous phases

---

## 📌 **Key Principle**

**Phase 32 turns configuration into storytelling.**

The bridge isn't built by editing settings — it's built by completing a visual narrative. Users don't think in "phases" — they think: "I'm building my bridge in the canvas."

---

## 🚀 **Implementation Priority**

### **Day 1: Blueprint System**
- Define blueprint JSON structure
- Create 3 core blueprints
- Build BlueprintGallery component

### **Day 2: Canvas UI**
- Build BridgeCanvas main interface
- Create ComponentPalette
- Implement drag-and-drop

### **Day 3: Gap Detection**
- Build GapDetector engine
- Create GuidanceEngine for contextual actions
- Integrate with existing components

### **Day 4: Deployment & Integration**
- Build BridgeActivator workflow
- Create StatusDashboard
- Integrate with Phase 30/31 forms

---

## 📚 **Related Documentation**

**Canvas-Assembly Evolution:**
- [Canvas-Assembly Architecture](../canvas-assembly/README.md) — Base structure
- [Phase 32 Implementation](phase-32.md) — This document

**Integration Points:**
- [Phase 30: Connectors](phase-30.md) — Connector integration
- [Phase 31A: Adapter Framework](phase-31A.md) — Adapter integration
- [Phase 31B: Document Intelligence](phase-31B.md) — Advanced adapters

**User Experience:**
- [Admin UI Guidelines](../ui/admin-guidelines.md) — UI consistency
- [Permission System](../security/permissions.md) — RBAC integration

---

**Phase 32 fulfills the original vision for canvas-assembly — a guided, blueprint-driven bridge builder that makes complex B2B integration accessible to non-technical users while providing depth for administrators.**

---

**Last Updated:** January 8, 2026  
**Status:** Planning Complete  
**Next Phase:** Implementation begins with blueprint system
