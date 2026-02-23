# Phase 31 — Layer 3: Unified Adapters & Connectors

**Planned:** January 8, 2026  
**Effort:** TBD (estimated 3-4 days)  
**Priority:** High (customer integration foundation)

## 🎯 Critical Principle: Symmetric Architecture

**🔁 Unified Adapter & Connector Model (Both Sides)**
✅ **Core Principle**: One codebase. One protocol. One deployment model.
Capabilities vary by license tier — not by code path.

| Component | Customer (Enterprise) | Trading Partner (Free) |
|-----------|----------------------|------------------------|
| **Onramp Adapter** | ✅ Full: DB, API, file, custom transforms | ✅ Limited: file only, no transforms |
| **Offramp Adapter** | ✅ Full: DB, API, SFTP, email, custom mappings | ✅ Limited: local file drop only |
| **Bridge Connector** | ✅ Full: AS2, SFTP, API, bidirectional | ✅ Limited: receive-only, pre-bound to sponsor org |
| **Configuration** | Via Admin UI + API | Via config file + token |
| **Authentication** | Org-scoped tokens with granular permissions | Sponsor-scoped token (Customer A's org), receive-only |

## 🧱 Standardized Architecture (Key for Reusability)

### **1. Adapter Interface (All Adapters Implement This)**
```typescript
interface BridgeFlowAdapter {
  // Common lifecycle
  validateConfig(config: AdapterConfig): boolean;
  authenticate(token: string): Promise<AuthContext>;
  
  // Onramp contract
  onramp(source: DataSource): Promise<PackagePayload>;
  
  // Offramp contract  
  offramp(package: Package, target: DataTarget): Promise<DeliveryResult>;
}
```

💡 **Same adapter binary runs for both tiers** — feature flags or token permissions enable/disable capabilities.

### **2. Connector Abstraction**
```typescript
BridgeConnector = protocol handler (AS2/SFTP/API)
Configurable direction:
- bidirectional (Enterprise)
- receive-only (Free TP)
```
Same binary, same logs, same update mechanism.

### **3. Token-Driven Capability Gates**
The token itself declares what's allowed:

```json
// Enterprise Token
{
  "orgId": "cust_a", 
  "tier": "enterprise", 
  "permissions": ["onramp:*", "offramp:*"] 
}

// Free TP Token  
{
  "orgId": "cust_a", 
  "tier": "free", 
  "permissions": ["offramp:file"], 
  "sponsorId": "cust_a"
}
```

→ **No code branching** — just permission checks.

## 🌉 Both Sides of the Bridge — Full Symmetry

| Flow | Customer A (Enterprise) | Trading Partner (Free) |
|------|-------------------------|------------------------|
| **Send Data Out** | Onramp → Package → Connector → TP | (Typically doesn't originate) |
| **Receive Data In** | Connector → Package → Offramp → System | Bridge Connector → Offramp → File Drop |
| **Add New Partner** | Admin UI → auto-issue free-tier token | Download agent + config from link |
| **Upgrade Path** | — | Free TP → Enterprise: unlock Onramp, APIs, transforms |

🔑 **Critical**: A Free TP could later become a Customer — their adapter auto-upgrades with new token. Zero re-install.

## 🎯 Objective

Establish Layer 3: Unified Data Exchange Adapters, which handle pre- and post-processing transformation between BridgeFlow's core Packages and customer-specific systems using a **symmetric, single-codebase architecture** with tiered capabilities controlled by token permissions.

## 📋 Core Deliverables (2/2)

### Phase 31A: Unified Adapter Framework
**Pluggable Adapter System**: One adapter framework for all tiers
- **Unified Interface**: All adapters implement the same BridgeFlowAdapter interface
- **Token-Based Gating**: Features enabled/disabled by token permissions, not code paths
- **Symmetric Deployment**: Same binary runs for customers and trading partners
- **Configuration Schema**: Supports all tiers with optional fields
- **Enterprise Features**: Full onramp/offramp capabilities with custom transforms
- **Free Tier Features**: Limited capabilities (file-only offramp, no transforms)

**Connector Integration**: Unified connector runtime
- **Bidirectional Support**: Enterprise customers get full bidirectional connectors
- **Receive-Only Mode**: Free trading partners get receive-only connectors
- **Protocol Support**: AS2, SFTP, API with same runtime
- **Sponsor Binding**: Free TP connectors pre-bound to sponsor organization

### Phase 31B: Intelligent Processing & Tier Management
**Enhanced Processing**: Smart document handling for all tiers
- **Auto-Type Detection**: Works for both enterprise and free tiers
- **Validation Framework**: Multi-format validation with tier-appropriate features
- **Transformation Engine**: Enterprise-only custom transforms, free tier gets basic mapping
- **Error Handling**: Comprehensive error reporting for all tiers

**Tier Management**: Seamless upgrade paths
- **Token-Based Upgrades**: Issue new token to unlock features
- **Zero-Reinstall**: Same binary automatically adapts to new capabilities
- **Feature Monitoring**: Track tier usage and upgrade opportunities
- **Admin Integration**: Enterprise customers manage free TP tokens via UI

## 🏗️ **Technical Architecture**

### **Unified Data Flow**
```
Customer System A ←→ Adapter ←→ BridgeFlow Package ←→ Connector ←→ Trading Partner System B
      ↓              ↓              ↓              ↓              ↓
  Raw Data    Same Binary    Standardized    Same Binary    Target Format
  Ingestion   All Tiers      Package        All Tiers      Delivery
```

### **Symmetric Adapter Architecture**
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Customer A   │    │  BridgeFlow    │    │   Trading      │
│   (Enterprise) │    │  Core         │    │   Partner      │
│               │    │               │    │   (Free)       │
│ ┌───────────┐ │    │ ┌───────────┐ │    │ ┌───────────┐ │
│ │ Adapter   │ │    │ │   Package  │ │    │ │ Adapter   │ │
│ │ (Same)    │────┼────│ │   Entity  │────┼────│ │ (Same)    │ │
│ └───────────┘ │    │ └───────────┘ │    │ └───────────┘ │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### **Security & Tier Model**
- **Token-Based Authentication**: Unified token system for all tiers
- **Permission Gates**: Features controlled by token permissions
- **Sponsor Relationships**: Free TPs bound to enterprise sponsors
- **Audit Trail**: Same logging for all tiers with tier-aware filtering
- **Network Isolation**: Adapters run in customer/partner infrastructure

## 📊 **Adapter Capabilities by Tier**

### **Enterprise Customer Adapters**
- **Onramp**: Full capabilities (DB, API, file, custom transforms)
- **Offramp**: Full capabilities (DB, API, SFTP, email, custom mappings)
- **Configuration**: Admin UI + API management
- **Authentication**: Org-scoped tokens with granular permissions
- **Support**: Premium support with SLA

### **Free Trading Partner Adapters**
- **Onramp**: Not available (typically doesn't originate data)
- **Offramp**: Limited to local file drop only
- **Configuration**: Config file + token from download link
- **Authentication**: Sponsor-scoped token, receive-only permissions
- **Support**: Community support + documentation

### **Upgrade Path**
- **Zero Reinstall**: Same binary automatically unlocks features
- **Token Swap**: New token enables enterprise capabilities
- **Data Migration**: Seamless transition with no data loss
- **Feature Discovery**: UI shows available features based on token

## 🔐 **Security & Authentication**

### **Unified Token System**
```javascript
// Enterprise Customer Token
{
  "adapterId": "customer-a-adapter-001",
  "orgId": "customer-a-id",
  "tier": "enterprise",
  "permissions": [
    "onramp:database",
    "onramp:api", 
    "onramp:file",
    "offramp:database",
    "offramp:api",
    "offramp:sftp",
    "offramp:email",
    "transform:custom"
  ],
  "expiresAt": "2026-12-31T23:59:59Z"
}

// Free Trading Partner Token
{
  "adapterId": "tp-b-adapter-001",
  "orgId": "customer-a-id", // Sponsor org
  "tier": "free",
  "permissions": [
    "offramp:file"
  ],
  "sponsorId": "customer-a-id",
  "expiresAt": "2026-12-31T23:59:59Z"
}
```

### **Permission-Based Feature Gates**
```typescript
class BridgeFlowAdapter {
  async onramp(source: DataSource): Promise<PackagePayload> {
    if (!this.hasPermission('onramp:*')) {
      throw new Error('Onramp not available in current tier');
    }
    // Implementation works for all tiers
  }
  
  async offramp(package: Package, target: DataTarget): Promise<DeliveryResult> {
    if (!this.hasPermission(`offramp:${target.type}`)) {
      throw new Error(`${target.type} offramp not available in current tier`);
    }
    // Implementation works for all tiers
  }
  
  private hasPermission(permission: string): boolean {
    return this.authContext.permissions.includes(permission) ||
           this.authContext.permissions.includes(permission.replace(/:.*$/, ':*'));
  }
}
```

## 🛠️ **Implementation Plan**

### **Phase 31A: Unified Framework (Days 1-2)**
1. **Adapter Interface**: Define BridgeFlowAdapter interface with tier-agnostic methods
2. **Permission System**: Implement token-based permission checking
3. **Base Adapter**: Create base adapter class with common functionality
4. **File Adapter**: Implement file system adapter (works for both tiers)
5. **Connector Integration**: Unified connector runtime with bidirectional/receive-only modes

### **Phase 31B: Tier Management (Days 3-4)**
1. **Enterprise Features**: Add database and API adapters (enterprise only)
2. **Transformation Engine**: Custom transforms for enterprise tier
3. **Free Tier Limits**: Implement permission-based feature gating
4. **Upgrade System**: Token-based upgrade mechanism
5. **Admin Integration**: Enterprise customer UI for managing free TP tokens

## 📈 **Success Criteria**

### ✅ **Unified Architecture**
- [ ] Single adapter binary works for both enterprise and free tiers
- [ ] Token permissions control feature availability (no code branching)
- [ ] Same connector runtime supports bidirectional and receive-only modes
- [ ] Configuration schema supports all tiers with optional fields
- [ ] Logging and metrics work identically on both sides

### ✅ **Tier Management**
- [ ] Free trading partners can onboard with zero cost
- [ ] Enterprise customers can manage free TP tokens via admin UI
- [ ] Upgrade path from free to enterprise requires only token swap
- [ ] Feature discovery shows available capabilities based on token
- [ ] Sponsor relationships properly enforced for free TPs

### ✅ **Developer Experience**
- [ ] Adapter SDK with unified interface for all tiers
- [ ] Clear documentation for enterprise vs free tier capabilities
- [ ] Testing framework works for both tiers
- [ ] Deployment is identical for all tiers
- [ ] Performance monitoring works across all tiers

## 🎯 **Real-World Use Cases**

### **Healthcare Provider (Enterprise) ↔ Insurance Company (Free TP)**
```
Healthcare EHR → Adapter (Enterprise) → Package → Connector → Adapter (Free TP) → Local File
      ↓                    ↓              ↓           ↓              ↓
  Patient Records      Full Onramp    AS2/SFTP    File Offramp    Claims Processing
```

### **Retail Supply Chain (Enterprise) ↔ Supplier (Free TP)**
```
Retail ERP → Adapter (Enterprise) → Package → Connector → Adapter (Free TP) → Local File
      ↓                    ↓              ↓           ↓              ↓
  Purchase Orders      Full Onramp    AS2/API     File Offramp    Order Processing
```

### **Financial Services (Enterprise) ↔ Regulatory Agency (Free TP)**
```
Bank Core → Adapter (Enterprise) → Package → Connector → Adapter (Free TP) → Local File
      ↓                    ↓              ↓           ↓              ↓
  Payment Orders      Full Onramp    SFTP        File Offramp    Payment Processing
```

## 📁 **Files to be Created**

### **Core Framework**
- `api/lib/adapter/BridgeFlowAdapter.ts` - Unified adapter interface
- `api/lib/adapter/PermissionManager.ts` - Token-based permission system
- `api/lib/adapter/BaseAdapter.ts` - Base adapter implementation
- `api/lib/adapter/AdapterManager.ts` - Adapter lifecycle management

### **Adapter Implementations**
- `api/lib/adapter/adapters/FileAdapter.ts` - File system adapter (both tiers)
- `api/lib/adapter/adapters/DatabaseAdapter.ts` - Database adapter (enterprise only)
- `api/lib/adapter/adapters/APIAdapter.ts` - API adapter (enterprise only)
- `api/lib/adapter/adapters/EmailAdapter.ts` - Email adapter (enterprise only)

### **Connector Integration**
- `api/lib/connectors/UnifiedConnector.ts` - Unified connector runtime
- `api/lib/connectors/ConnectorMode.ts` - Bidirectional vs receive-only modes
- `api/lib/connectors/SponsorManager.ts` - Free TP sponsor relationship management

### **Frontend Implementation**
- `admin-bridgeflow/src/pages/Adapters.jsx` - Enterprise adapter management
- `admin-bridgeflow/src/pages/TradingPartnerAdapters.jsx` - Free TP token management
- `admin-bridgeflow/src/components/AdapterBuilder.jsx` - Adapter configuration builder
- `admin-bridgeflow/src/components/TierIndicator.jsx` - Tier capability indicator

### **Database Schema**
- `Adapter` model - Unified adapter registration (supports both tiers)
- `AdapterToken` model - Token-based authentication and permissions
- `SponsorRelationship` model - Free TP to enterprise sponsor relationships
- `AdapterCapability` model - Tier-specific capability tracking

### **SDK & Documentation**
- `docs/adapters/SDK.md` - Unified adapter development guide
- `docs/adapters/tiers.md` - Enterprise vs free tier capabilities
- `docs/adapters/permissions.md` - Token-based permission system
- `docs/adapters/examples/` - Sample adapters for both tiers

## 🔄 **Integration Points**

### **Phase 30 Integration**
- **Package Creation**: Unified adapters create standardized packages
- **Protocol Processing**: Unified connectors handle Layer 2 processing
- **Package Delivery**: Both tiers receive processed packages
- **Status Tracking**: End-to-end package lifecycle across tiers

### **Phase 28 Integration**
- **Tenet Application**: Business rules applied during package creation
- **Package Management**: Unified package lifecycle for all tiers
- **Statistics**: Tier-aware statistics and monitoring
- **Admin Experience**: Enterprise customers manage all adapters from single UI

### **Phase 29 Integration**
- **Organization Scoping**: Enterprise customers manage their free TPs
- **Multi-Tenancy**: Proper data isolation across tiers
- **CTO Access**: Global view of all adapters and tiers
- **Security**: Unified RBAC across enterprise and free tiers

## 🚀 **Next Steps**

### **Phase 32+: Advanced Unified Features**
- **Machine Learning**: Intelligent transformation suggestions (enterprise only)
- **Real-Time Processing**: Streaming adapters (enterprise only)
- **Advanced Security**: Hardware token support (enterprise only)
- **Performance Optimization**: Tier-aware optimization strategies
- **Integration Marketplace**: Pre-built adapter templates (both tiers)

### **Enterprise Features**
- **Multi-Tenant Adapters**: Shared adapters across enterprise organizations
- **Advanced Analytics**: Enterprise-only adapter performance analytics
- **Compliance Reporting**: Enterprise compliance reporting
- **Disaster Recovery**: Enterprise disaster recovery procedures

### **Free Tier Enhancements**
- **Web-Based Setup**: Browser-based free TP adapter configuration
- **Mobile Support**: Mobile app for free TP monitoring
- **Community Features**: Community-driven adapter sharing
- **Upgrade Incentives**: Clear upgrade path visualization

## 🛠 **Critical Implementation Guidelines**

### **Do This Now**
- ✅ Build adapters as pluggable modules (not monolithic)
- ✅ Use token permissions to gate features (not separate binaries)
- ✅ Design config schema to support all tiers (with optional fields)
- ✅ Ensure logging/metrics work identically on both sides
- ✅ Create unified deployment package for all tiers

### **Avoid This**
- ❌ Separate "free" and "enterprise" codebases
- ❌ Hardcoded feature checks (if (isFree) ...)
- ❌ Different deployment packages
- ❌ Tier-specific configuration files
- ❌ Separate monitoring systems

## 🎯 **Strategic Outcome**

- **Customer A** onboards TPs in minutes via admin UI
- **TPs** get immediate value with zero cost and frictionless setup
- **BridgeFlow** owns the integration layer on both sides with unified architecture
- **Upgrade path** is frictionless — just issue a new token
- **Scalability** achieved through single codebase with tiered permissions

---

**Phase 31 establishes the critical unified bridge between BridgeFlow and customer systems using a symmetric, single-codebase architecture that scales from free trading partners to enterprise customers through token-based capability gates. This is how you build a scalable, defensible, two-sided platform.**
