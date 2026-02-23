# Blueprints: Technical Overview

## Data Model

The `BridgeBlueprint` model is the core entity. It supports multi-tenancy via `organizationId`.

```prisma
model BridgeBlueprint {
  id             String        @id @default(cuid())
  slug           String
  name           String
  description    String?
  type           String        @default("bridge") // new in Phase 38: bridge | integration
  tier           String        @default("free") // free, enterprise
  config         String        // JSON: components, connections, required maps
  organizationId String?       // Null = Public, Set = Private
  category       String?       // e.g., retail, healthcare, logistics
  difficulty     String?       // beginner, intermediate, advanced
  estimatedTime  String?       // "30 minutes", "2 hours"
  icon           String?       // emoji or icon identifier
  tags           String[]      // searchable tags
  isActive        Boolean       @default(true)
  createdAt       DateTime       @default(now())
  updatedAt       DateTime       @updatedAt
  
  @@unique([slug, organizationId]) // Unique slug per scope
}

// Phase 38 addition: new model to track deployments
model BlueprintInstance {
  id            String   @id @default(cuid())
  blueprintId   String
  status        String   // PENDING, PROVISIONING, ACTIVE, ERROR
  createdBy     String?
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
  metadata      Json?
}
```

## 🌉 Bridge Visualization Integration

### Phase 32+ Bridge Outline Enhancement
The blueprint system now includes visual configuration for bridge outline rendering:

#### Required Components Mapping
```javascript
// Blueprint config structure for bridge visualization
{
  "required": ["trading-partner", "connector", "trading-partner"],
  "definition": {
    "requiredConnectors": [
      { "type": "AS2", "direction": "EGRESS", "packageType": "850" },
      { "type": "AS2", "direction": "INGRESS", "packageType": "810" }
    ]
  }
}
```

#### Visual Slot Determination
- **Required slots**: Orange dashed circles with pulse animation
- **Optional slots**: Gray dashed circles (static)
- **Slot mapping**: Based on blueprint `required` array and component types

## API Architecture

We strictly separate Public (Catalog) and Private (Management) access to ensure security.

### Public API (`GET /api/blueprints`)
- **Purpose**: Power the "Browse Blueprints" UI for all users.
- **Behavior**: Returns **only** public blueprints (`organizationId: null`).
- **Security**: Authenticated users only. Enterprise users view the global public catalog here. They do *not* see their private blueprints mixed in.

### Admin API (`/admin-api/blueprints`)
- **Purpose**: Manage private blueprints for organizations.
- **Behavior**: Scoped to the user's organization.
- **endpoints**:
  - `POST /`: Create a new blueprint. (BF Admins -> Public, Org Admins -> Private).
  - `GET /`: List blueprints belonging to the user's organization.

## 🔧 Bridge Outline Technical Implementation

### Frontend Rendering Pipeline
1. **Blueprint Selection** → `loadBlueprintToCanvas(template)`
2. **Visual Processing** → `renderBridgeOutline(template)`
3. **Slot Creation** → Interactive circles positioned at bridge integration points
4. **Gap Filling** → `triggerBridgeSlotConfiguration(slotType, isRequired, blueprint)`

### Data Flow Integration
```javascript
// Blueprint → Bridge Outline mapping
const requiredItems = template.config?.required || template.required || [];

// Slot type determination
const isRequired = requiredItems.some(req => 
  req.toLowerCase().includes(slot.type) || 
  (slot.type === 'source' && req.toLowerCase().includes('trading-partner')) ||
  (slot.type === 'destination' && req.toLowerCase().includes('trading-partner'))
);
```

### CSS Animation Classes
```css
.bridge-slot {
  /* Required slot styling */
  border: 3px dashed #F97316;
  animation: pulse 2s infinite;
}

.bridge-slot.optional {
  /* Optional slot styling */
  border: 3px dashed #D1D5DB;
  animation: none;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.7; }
}
```

## Security & RBAC

- **Free Users**: Can view Public Catalog. Cannot create blueprints.
- **Customer Admins**: Can view Public Catalog. Can create/manage their own Private Blueprints via Admin API.
- **BridgeFlow Admins**: Can create/manage Public Blueprints.

## 🎨 Visual Design System

### Color Semantics
- **Orange (`#F97316`)**: Required components (attention/action needed)
- **Gray (`#D1D5DB`)**: Optional components (less prominent)
- **White (`rgba(255, 255, 255, 0.9)`)**: Background for slots
- **Blue (`#3B82F6`)**: Completed/active states

### Accessibility Standards
- **ARIA Labels**: "Add Source System - Required component"
- **Keyboard Navigation**: `tabindex="0"` on all interactive slots
- **High Contrast**: 4.5:1 ratio maintained
- **Screen Reader**: Semantic `role="button"` usage

---

*The bridge outline visualization transforms blueprints from static templates into interactive building experiences, making the integration process intuitive and visually engaging.* 🌉
