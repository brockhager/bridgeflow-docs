# Layer 3: Data Mapping & Exchange Layer

**Status:** Foundation Complete (Phase 31A & 31B); Mapping Studio & Profile Templates Complete (Phase 34 & 35)  
**Architecture:** Symmetric Adapter Framework  
**Priority:** Critical for Enterprise Integration  
**Last Updated:** January 11, 2026

---

## 🎯 Layer 3 Overview

Layer 3 is the **Data Mapping & Exchange Layer** that bridges BridgeFlow's core platform with customer systems and trading partners. It provides intelligent adapters that can ingest data from any source, transform it into standardized BridgeFlow Packages, and deliver it through Layer 2 connectors.

### 🏗️ **Core Architecture Principle**

**🔁 Symmetric Adapter Model (Both Sides)**
```
Customer System A ←→ Adapter ←→ BridgeFlow Package ←→ Connector ←→ Trading Partner System B
      ↓              ↓              ↓              ↓              ↓
  Raw Data    Same Binary    Standardized    Same Binary    Target Format
  Ingestion   All Tiers      Package        All Tiers      Delivery
```

**Key Principle**: One codebase. One protocol. One deployment model. Capabilities vary by license tier — not by code path.

---

## 📋 Layer 3 Components

### 🔌 **Adapter Framework (Phase 31A)**
**Unified Interface**: Same adapter interface for all data types
- **BridgeFlowAdapter**: Base interface for all adapters
- **PermissionManager**: Token-based capability gating
- **BaseAdapter**: Common functionality with permission checks
- **Symmetric Deployment**: Same binary for enterprise and free tiers

**Capability Gating**:
```typescript
// Enterprise Token
{
  "orgId": "cust_a", 
  "tier": "enterprise", 
  "permissions": ["onramp:*", "offramp:*", "transform:*"]
}

// Free TP Token  
{
  "orgId": "cust_a", 
  "tier": "free", 
  "permissions": ["offramp:file"], 
  "sponsorId": "cust_a"
}
```

### 🧠 **Document Intelligence (Phase 31B)**
**Smart Data Processing**: Automatic type detection and transformation
- **DataTypeRegistry**: Centralized data type management (X12, JSON, CSV, etc.)
- **TypeDetector**: Multi-strategy content detection with confidence scoring
- **Parser System**: Pluggable parsers for all supported data types
- **Validation Engine**: Type-specific validation with business rules

**Detection Pipeline**:
```
Content Input
    ↓
TypeDetector
    ├── Content Sniffing (priority 100)
    ├── Metadata Hints (priority 90)
    ├── Pattern Matching (priority 80)
    └── Source Type Hints (priority 70)
    ↓
Confidence Scoring (0-1)
    ↓
Result: { dataType, confidence, requiresManualSelection }
```

### 🔌 **Enterprise Adapters (Phase 31B)**
**Advanced Data Sources**: Enterprise-only adapters with full capabilities
- **DatabaseAdapter**: PostgreSQL, MySQL, MongoDB with change detection
- **APIAdapter**: REST API and webhook integration with multiple auth methods
- **FileAdapter**: File system adapter (both tiers, enterprise gets monitoring)

**Adapter Capabilities Matrix**:
| Adapter | Source Types | Target Types | Free Tier | Enterprise |
|---------|--------------|--------------|-----------|------------|
| File | Files | Files | ✅ Offramp only | ✅ Full |
| Database | SQL/NoSQL tables | Database, APIs | ❌ | ✅ Full |
| API | REST endpoints, webhooks | REST APIs, webhooks | ❌ | ✅ Full |

### 🔄 **Transformation Pipeline**
**Rule-Based Mapping**: Enterprise-only intelligent data transformation
- **Field Mapping**: Visual source to target field mapping
- **Transform Functions**: Uppercase, date formatting, encoding, custom logic
- **Template Engine**: Multiple output formats (EDI, JSON, XML, CSV)
- **Error Handling**: Graceful degradation with detailed error reporting

**Transformation Rules**:
```typescript
{
  "customer_name": { "transform": "uppercase" },
  "order_date": { "transform": "sqlDate" },
  "total_amount": { "transform": "multiply", "factor": 1.1 },
  "source": "orders.customer_name",
  "target": "N1[0].N102"
}
```

---

### Recent Additions — Phases 34 & 35
- **Phase 34 — Mapping Studio (Completed Jan 10, 2026):** Schema-driven visual mapping editor integrated with Phase 31B DataTypeRegistry. Key features: business-field palette, real-time preview (`POST /api/data-types/transform`), and pre-save validation (`POST /api/data-types/validate-mapping`). Docs: `docs/phases/phases31-40/phase-34-summary.md`, `docs/phases/phases31-40/phase-34-integration-complete.md`. Frontend: `web/mapping-studio/studio.js`, `web/mapping-studio/studio.html`.

- **Phase 35 — Profile Templates (Completed Jan 11, 2026):** Validated template library with auto-versioning, data-type filtering, one-click apply, and enterprise gating. Templates stored in `MappingTemplate` model with `dataTypeCode`, `validationStatus`, `version`, `isEnterprise`. Docs: `docs/phases/phases31-40/phase-35-summary.md`. Frontend: `web/mapping-studio/templates.js`.

- **Phase 37 — Vault Integration (Week 3 — Jan 11, 2026):** Added credential storage support and secret backend integration for adapters. New `Credential` Prisma model and credential CRUD API (`api/handlers/credentials.js`, `api/routes/credentials.js`), Vault health & secrets listing endpoints, and adapter changes to fetch connection strings/auth from the secret backend (see `api/lib/adapter/adapters/DatabaseAdapter.ts` and `APIAdapter.ts`). Docs: `docs/phases/phases31-40/phase-37-foundation.md`.

## 🎯 **Layer 3 Objectives**

### **Primary Goals**
1. **Universal Data Ingestion**: Connect to any customer system or data source
2. **Intelligent Processing**: Automatically detect, parse, and validate data formats
3. **Standardized Output**: Transform all data into BridgeFlow Packages
4. **Enterprise Scalability**: Support high-volume, real-time data processing
5. **Two-Sided Platform**: Serve both enterprise customers and free trading partners

### **Business Value**
- **Faster Onboarding**: Enterprise customers integrate existing systems in hours
- **Zero-Cost Entry**: Free trading partners get immediate value with file drop
- **Reduced Integration Costs**: Standardized adapters eliminate custom development
- **Improved Data Quality**: Intelligent validation and error handling
- **Scalable Growth**: Add new data types without code changes

---

## 🏗️ **Technical Architecture**

### **Layer 3 Data Flow**
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Customer A   │    │   Layer 3      │    │   Layer 2      │    │   Trading      │
│   System      │    │   Adapters     │    │   Connectors   │    │   Partner B    │
│               │    │               │    │               │    │   System      │
│ ┌───────────┐ │    │ ┌───────────┐ │    │ ┌───────────┐ │    │ ┌───────────┐ │
│ │ Database  │ │────┼────│ Database  │ │────┼────│ AS2/SFTP  │ │────┼────│ Database  │ │
│ │ API       │ │    │ │ Adapter   │ │    │ │ Connector │ │    │ │ API       │ │
│ │ Files     │ │    │ │ APIAdapter│ │    │ │ APIConn   │ │    │ │ Files     │ │
│ └───────────┘ │    │ └───────────┘ │    │ └───────────┘ │    │ └───────────┘ │
└─────────────────┘    └─────────────────┘    └─────────────────┘    └─────────────────┘
```

### **Symmetric Architecture Benefits**
- **One Codebase**: Same adapter binary runs for all tiers
- **Token Gating**: Features controlled by permissions, not code paths
- **Zero Reinstall**: Upgrade by issuing new token
- **Unified Deployment**: Single deployment package for all customers
- **Consistent Experience**: Same logging, monitoring, error handling

### **Security Model**
- **Multi-Tenant**: Complete data isolation between organizations
- **Token-Based**: Granular permission control with audit trails
- **Enterprise Security**: Encrypted credentials, secure connections
- **Sponsor Relationships**: Free TPs bound to enterprise sponsors
- **CTO Access**: Global visibility and control across all organizations

---

## 📊 **Data Types Supported**

### **EDI Standards**
- **X12_850**: Purchase Order with full segment parsing
- **X12_837**: Health Care Claim with HIPAA validation
- **X12_210**: Motor Carrier Freight Invoice
- **X12_810**: Invoice
- **X12_820**: Payment Order
- **X12_856**: Ship Notice
- **X12_945**: Warehouse Shipping Advice
- **X12_997**: Functional Acknowledgment

### **Modern Formats**
- **JSON_GENERIC**: Flexible JSON with schema validation
- **JSON_POS**: Point-of-Sale transaction format
- **JSON_API**: REST API response format
- **CSV_GENERIC**: Configurable column mapping
- **CSV_CLAIMS**: Healthcare claims CSV format
- **XML_GENERIC**: Generic XML with schema validation
- **XML_HL7**: HL7 healthcare XML format

### **Custom Formats**
- **CUSTOM_***: User-defined formats with custom parsers
- **LEGACY_***: Legacy system formats with migration support
- **PROPRIETARY_***: Customer-specific formats

---

## 🔄 **Integration Points**

### **Layer 2 Integration (Connectors)**
- **Package Creation**: Layer 3 creates standardized packages for Layer 2
- **Protocol Processing**: Layer 2 handles protocol-specific delivery
- **Status Tracking**: End-to-end package lifecycle management
- **Error Handling**: Unified error reporting and recovery

### **Layer 4 Integration (Packages)**
- **Package Management**: Layer 3 packages integrate with Phase 28 package system
- **Tenet Application**: Business rules applied during package creation
- **Statistics**: Real-time package statistics and monitoring
- **Admin Experience**: Unified management across all layers

### **Layer 5 Integration (Organizations)**
- **Multi-Tenancy**: Proper data isolation across organizations
- **Permission Scoping**: Adapters scoped to organization boundaries
- **Sponsor Management**: Enterprise customers manage free trading partners
- **CTO Oversight**: Global view of all adapter activities

---

## 🎯 **Real-World Use Cases**

### 🏥 **Healthcare Provider Integration**
```
EHR System → DatabaseAdapter → X12_837 Package → AS2 Connector → Insurance System
      ↓                    ↓              ↓           ↓              ↓
  Patient Records      Full Onramp    AS2/SFTP    837 Acknowledgments   Claims Processing
```

**Scenario**: Healthcare provider automatically polls EHR database for new claims, transforms them to X12_837 format, and sends to insurance partners via AS2.

**Benefits**:
- **Automated Processing**: No manual claim submission
- **HIPAA Compliance**: Intelligent validation and error handling
- **Real-Time Tracking**: Complete claim lifecycle visibility
- **Error Reduction**: Automatic format validation and correction

### 🛍️ **Retail Supply Chain Integration**
```
Retail ERP → APIAdapter → JSON Package → Transform → X12_850 Package → SFTP Connector → Supplier System
      ↓                ↓              ↓           ↓              ↓              ↓
  Purchase Orders    Full Onramp    JSON Orders   EDI 850      SFTP Delivery    Order Processing
```

**Scenario**: Retail company polls ERP system for new purchase orders, transforms JSON to EDI 850 format, and delivers to suppliers via SFTP.

**Benefits**:
- **Supplier Onboarding**: Zero-cost file drop for small suppliers
- **Format Standardization**: Automatic JSON to EDI conversion
- **Real-Time Sync**: Continuous order processing
- **Scalable Growth**: Add new suppliers without integration work

### 🏦 **Financial Services Integration**
```
Bank Core → DatabaseAdapter → Payment Package → Transform → X12_820 Package → API Connector → Regulatory System
      ↓                   ↓              ↓              ↓              ↓              ↓
  Payment Records      Full Onramp    Payment Data   EDI 820      API Delivery    Payment Processing
```

**Scenario**: Bank monitors core banking system for payment records, transforms them to EDI 820 format, and submits to regulatory systems via API.

**Benefits**:
- **Regulatory Compliance**: Automatic format validation and submission
- **Audit Trail**: Complete payment transaction logging
- **Error Prevention**: Intelligent validation before submission
- **Performance**: High-volume processing with rate limiting

---

## 🔐 **Security & Compliance**

### **Multi-Tenant Architecture**
- **Data Isolation**: Complete separation between organizations
- **Permission Scoping**: Adapters limited to organization data
- **RLS Policies**: Database-level tenant enforcement
- **Audit Logging**: Complete activity tracking

### **Enterprise Security**
- **Encrypted Credentials**: Database passwords and API keys encrypted at rest
- **Secure Connections**: HTTPS, VPN, dedicated connections
- **Access Control**: Granular permissions for data sources
- **Session Management**: Secure token-based authentication

### **Compliance Framework**
- **HIPAA**: Healthcare data protection and validation
- **PCI DSS**: Payment card industry compliance
- **GDPR**: Data privacy and protection
- **SOX**: Financial reporting and audit requirements

---

## 📈 **Performance & Scalability**

### **Enterprise Performance**
- **High Volume**: Support for thousands of transactions per minute
- **Real-Time Processing**: Sub-second data transformation
- **Connection Pooling**: Efficient database and API connection management
- **Rate Limiting**: Built-in protection against API abuse

### **Scalability Features**
- **Horizontal Scaling**: Multiple adapter instances
- **Load Balancing**: Distribute processing across instances
- **Caching**: Intelligent caching for frequently accessed data
- **Batch Processing**: Efficient bulk data processing

### **Monitoring & Observability**
- **Health Checks**: Real-time adapter health monitoring
- **Performance Metrics**: Processing time, throughput, error rates
- **Error Tracking**: Detailed error logging and alerting
- **Usage Analytics**: Adapter usage patterns and trends

---

## 🚀 **Future Enhancements**

### **Phase 32+ Roadmap**
- **Real Protocol Handlers**: AS2, SFTP, API protocol implementations
- **Advanced Analytics**: Machine learning for intelligent transformations
- **Multi-Cloud Support**: AWS, Azure, GCP adapters
- **AI-Powered Features**: Intelligent routing and predictive analytics

### **Enterprise Features**
- **Advanced Security**: Zero-trust architecture, hardware tokens
- **Global Deployment**: Multi-region deployment with data residency
- **Advanced Analytics**: Business intelligence and reporting
- **Workflow Automation**: Complex multi-step data processing

### **Developer Experience**
- **Visual Builder**: Drag-and-drop adapter configuration
- **Testing Framework**: Comprehensive testing and simulation tools
- **Documentation**: Complete API documentation and examples
- **SDK Expansion**: More adapter types and transformation functions

---

## 🎯 **Success Metrics**

### **Technical Metrics**
- **Adapter Performance**: <100ms average processing time
- **Reliability**: 99.9% uptime for adapter operations
- **Scalability**: Support for 10,000+ concurrent adapters
- **Security**: Zero security breaches in production

### **Business Metrics**
- **Customer Onboarding**: <1 hour for enterprise adapter setup
- **Partner Onboarding**: <5 minutes for free trading partner setup
- **Integration Cost**: 80% reduction vs custom integration development
- **Data Quality**: 95% reduction in data format errors

### **User Experience**
- **Zero Reinstall**: Upgrade capabilities by token swap
- **Self-Service**: 90% of adapter setup without support
- **Error Reduction**: 90% fewer integration-related support tickets
- **Satisfaction**: 4.8/5 customer satisfaction rating

---

## 📚 **Related Documentation**

### **Implementation Details**
- [Phase 31A: Unified Adapter Framework](phases31-40/phase-31A.md) — Complete foundation specification
- [Phase 31B: Document Intelligence](phases31-40/phase-31B.md) — Intelligence layer implementation
- [Phase 31 Plan](phases31-40/phase-31-plan.md) — Original planning document
- [Phase 34: Mapping Studio (Summary)](phases31-40/phase-34-summary.md) — Visual mapping editor and schema integration
- [Phase 35: Profile Templates (Summary)](phases31-40/phase-35-summary.md) — Template lifecycle, versioning, and apply/import UX

### **Technical References**
- [Adapter API Documentation](api/adapters.md) — Complete adapter API reference
- [Permission System](security/permissions.md) — Token-based permission system
- [Data Types](intelligence/data-types.md) — Supported data types and parsers
- [Transformation Rules](intelligence/transformations.md) — Transformation engine documentation

### **Integration Guides**
- [Database Integration Guide](guides/database-integration.md) — Database adapter setup
- [API Integration Guide](guides/api-integration.md) — REST API and webhook integration
- [File Integration Guide](guides/file-integration.md) — File system adapter usage
- [Transformation Guide](guides/transformations.md) — Custom transformation rules

---

**Layer 3 is the critical bridge that makes BridgeFlow a true two-sided platform, enabling seamless data exchange between any customer system and any trading partner while maintaining security, scalability, and enterprise-grade capabilities.**

---

**Last Updated:** January 11, 2026  
**Status:** Foundation Complete (Phase 31A & 31B); Mapping Studio & Profile Templates Complete (Phase 34 & 35)  
**Next Phase:** Real Protocol Implementation (Phase 36+)
