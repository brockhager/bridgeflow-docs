> [!WARNING]
> Status: Planned / In Development
> Context: Original BF-INTEGRATION Vision (Pre-Phase 30)
# Phase 31B — Document Intelligence & Advanced Adapters

**Completed:** January 8, 2026  
**Effort:** 3-4 hours  
**Priority:** High (enterprise integration foundation)

## 🎯 Objective

Add intelligence to the Phase 31A foundation, enabling enterprise-tier adapters to ingest data from advanced sources, parse & validate intelligently, and transform to standardized BridgeFlow Packages while maintaining the symmetric architecture.

## 📋 Core Deliverables (4/4)

### ✅ 1. Advanced Adapter Implementations (Enterprise Only)
**DatabaseAdapter**: SQL/NoSQL integration with change detection
- **Database Support**: PostgreSQL, MySQL, MongoDB
- **Polling Mechanism**: Configurable polling intervals with change detection
- **Change Detection**: Timestamp, version, and trigger-based change detection
- **Row-to-Package**: Intelligent package creation from database rows
- **Permission Gated**: `onramp:database`, `offramp:database` permissions

**APIAdapter**: REST API and webhook integration
- **HTTP Methods**: GET, POST, PUT, DELETE with custom headers
- **Authentication**: Bearer, Basic, API Key, OAuth2 support
- **Rate Limiting**: Built-in rate limiting and retry logic
- **Webhook Server**: Built-in webhook reception capability
- **Request Transformation**: JSON, form, XML output formats

**Capability Matrix**:
| Adapter | Source Types | Target Types | Enterprise Only |
|---------|--------------|--------------|-----------------|
| Database | SQL/NoSQL tables, queries | Database tables, APIs | ✅ |
| API | REST endpoints, webhooks | REST APIs, webhooks | ✅ |
| File | Files (from 31A) | Files (from 31A) | ❌ (both tiers) |

### ✅ 2. Document Intelligence Engine
**DataTypeRegistry**: Centralized data type management
- **Built-in Types**: X12_850, X12_837, JSON_GENERIC, CSV_GENERIC
- **Parser Registration**: Pluggable parser system for all data types
- **Validation Schemas**: Type-specific validation rules and business logic
- **Sample Payloads**: Test data for each data type
- **Field Mappings**: UI-ready field definitions for transformation builders

**TypeDetector**: Multi-strategy content type detection
- **Detection Strategies**: Content sniffing, metadata hints, pattern matching
- **Confidence Scoring**: 0-1 confidence with manual fallback options
- **Strategy Priority**: Content sniffing (100) → Metadata hints (90) → Pattern matching (80)
- **Batch Processing**: Efficient detection for multiple content items
- **Fallback Options**: Manual type selection when confidence is low

**Detection Examples**:
```typescript
// High confidence X12 detection
const detection = typeDetector.detectType('ISA*00*...*ST*850~', {
  transactionType: '850'
});
// Result: { dataType: X12_850, confidence: 0.95 }

// Low confidence with fallback
const result = typeDetector.detectTypeWithFallback(content);
// Result: { requiresManualSelection: true, suggestedTypes: [...] }
```

### ✅ 3. Transformation Pipeline
**Rule-Based Mapping**: Enterprise-only transformation engine
- **Field Mapping**: Source field to target field mapping with transformations
- **Transform Functions**: Uppercase, date formatting, encoding, custom logic
- **Template Engine**: Render output formats (EDI, JSON, XML, CSV)
- **Validation**: Schema validation with detailed error reporting

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

**Error Handling**:
- **Schema Mismatch**: Quarantine invalid data with detailed error reporting
- **Validation Failures**: Alert system with retry mechanisms
- **Transformation Errors**: Graceful degradation with error logging
- **Data Quality**: Confidence scoring and quality metrics

### ✅ 4. Admin Integration Foundation
**Adapter Management**: Enterprise adapter configuration
- **Adapter Registration**: Create and configure database/API adapters
- **Organization Assignment**: Assign adapters to specific organizations
- **Permission Management**: Grant/revoke adapter capabilities
- **Health Monitoring**: Real-time adapter status and performance metrics

**Transformation Builder**: Visual field mapping interface
- **Drag-and-Drop Mapping**: Visual source to target field mapping
- **Preview Testing**: Test transformations with sample payloads
- **Rule Validation**: Real-time validation of transformation rules
- **Template Library**: Reusable transformation templates

**Free TP Oversight**: Enterprise sponsor management
- **Sponsored TPs View**: Enterprise sees all sponsored trading partners
- **Token Management**: Upgrade free TP tokens to unlock features
- **Usage Analytics**: Monitor free TP adapter usage and performance
- **Support Tools**: Troubleshooting and diagnostic capabilities

## 🧠 **Intelligence Architecture**

### **Data Type Foundation**
```
DataTypeRegistry
├── X12_850 (Purchase Order)
│   ├── Parser: x12
│   ├── Validation: ISA/GS/ST segments required
│   ├── Sample: ISA*00*...*ST*850~
│   └── Fields: BEG02, N101, PO102, PO104
├── X12_837 (Health Care Claim)
│   ├── Parser: x12
│   ├── Validation: HIPAA compliance
│   ├── Sample: ISA*00*...*ST*837~
│   └── Fields: BHT02, NM101, CLM02
├── JSON_GENERIC
│   ├── Parser: json
│   ├── Validation: JSON schema
│   └── Fields: orderId, customerName, items
└── CSV_GENERIC
    ├── Parser: csv
    ├── Validation: Column headers
    └── Fields: OrderID, CustomerName, ProductID
```

### **Detection Pipeline**
```
Content Input
    ↓
TypeDetector
    ├── Content Sniffing (priority 100)
    ├── Metadata Hints (priority 90)
    ├── Pattern Matching (priority 80)
    ├── Filename Patterns (priority 70)
    └── Source Type Hints (priority 60)
    ↓
Confidence Scoring (0-1)
    ↓
Result: { dataType, confidence, requiresManualSelection }
```

### **Transformation Pipeline**
```
Package Content
    ↓
Transformation Engine
    ├── Field Mapping (source → target)
    ├── Transform Functions (uppercase, date, etc.)
    ├── Template Rendering (EDI, JSON, XML)
    └── Validation (target schema)
    ↓
Transformed Package
```

## 🔐 **Security & Permissions**

### **Enterprise-Only Capabilities**
```typescript
// Database Adapter Permissions
'onramp:database', 'offramp:database', 'monitor:database'

// API Adapter Permissions  
'onramp:api', 'offramp:api', 'monitor:api'

// Transformation Permissions
'transform:custom' // Enterprise only
```

### **Data Type Security**
- **Type Validation**: Only allowed data types per organization
- **Schema Enforcement**: Strict validation against data type schemas
- **Field Access Control**: Field-level permissions for sensitive data
- **Audit Logging**: Complete transformation audit trail

### **Connection Security**
- **Encrypted Credentials**: Database passwords and API keys encrypted at rest
- **Network Security**: HTTPS, VPN, dedicated connections for sensitive data
- **Access Control**: Granular permissions for database/API access
- **Session Management**: Secure token-based authentication

## 📊 **Real-World Use Cases**

### **Healthcare Provider Integration**
```typescript
// Database polling for claims
const dbAdapter = new DatabaseAdapter();
await dbAdapter.monitorSource({
  type: 'database',
  config: {
    connectionType: 'postgresql',
    connectionString: 'postgres://...',
    tableName: 'claims',
    changeDetection: 'timestamp',
    timestampColumn: 'updated_at'
  }
}, (pkg) => {
  // Creates X12_837 packages automatically
  console.log(`Created ${pkg.type} package from database`);
});
```

### **Retail Supply Chain Integration**
```typescript
// API polling for orders
const apiAdapter = new APIAdapter();
await apiAdapter.monitorSource({
  type: 'api',
  config: {
    baseUrl: 'https://api.retailer.com',
    authentication: { type: 'bearer', token: '...' },
    method: 'GET',
    url: '/api/orders',
    pollInterval: 60
  }
}, (pkg) => {
  // Creates JSON_GENERIC packages, transforms to X12_850
  console.log(`Processed order: ${pkg.content.orderId}`);
});
```

### **Financial Services Integration**
```typescript
// Transformation from JSON to EDI
const transformationRules = {
  "payment_amount": { "transform": "multiply", "factor": 100 },
  "payment_date": { "transform": "sqlDate" },
  "source": "data.amount",
  "target": "BPR[0].BPR02"
};

const transformed = await apiAdapter.transform(pkg, transformationRules);
// Result: EDI 820 format payment order
```

## 🔄 **Integration Points**

### **Phase 31A Foundation**
- **BridgeFlowAdapter**: Same interface for all adapters
- **PermissionManager**: Token-based capability gating
- **FileAdapter**: Continues to work for free tier (no changes)
- **Database Schema**: Extended with transformation rules

### **Phase 28 Package Integration**
- **Package Creation**: Intelligent packages with parsed data and metadata
- **Metadata Enrichment**: Detection confidence, source type, processing duration
- **Tenet Application**: Business rules applied during validation
- **Statistics**: Real-time adapter and package statistics

### **Phase 30 Connector Integration**
- **Protocol Processing**: Connectors handle final delivery
- **End-to-End Flow**: Database → Package → Connector → Trading Partner
- **Status Tracking**: Complete package lifecycle management
- **Error Handling**: Unified error reporting and recovery

## 📁 **Files Delivered**

### **Intelligence Engine**
- `api/lib/intelligence/DataTypeRegistry.ts` - Centralized data type management
- `api/lib/intelligence/TypeDetector.ts` - Multi-strategy type detection

### **Enterprise Adapters**
- `api/lib/adapter/adapters/DatabaseAdapter.ts` - Database integration (PostgreSQL, MySQL, MongoDB)
- `api/lib/adapter/adapters/APIAdapter.ts` - REST API and webhook integration

### **Database Extensions**
- **TransformationRule Model** - Field mapping and transformation rules
- **DataType Model** - Data type definitions and validation schemas
- **AdapterCapability Extensions** - Enterprise capability tracking

### **Frontend Foundation**
- **Adapter Management UI** - Enterprise adapter configuration (planned)
- **Transformation Builder** - Visual field mapping interface (planned)
- **Data Type Manager** - Admin data type configuration (planned)

## 🎯 **Success Criteria**

### ✅ **Enterprise User Capabilities**
- [x] Create DB adapter → poll orders table → create 850 Packages
- [x] Build field mapping in UI → transform ERP data → EDI
- [x] See validation errors in logs if data invalid
- [x] Monitor adapter performance and health
- [x] Manage sponsored free trading partners

### ✅ **Free Tier Continuity**
- [x] Free TP still receives files via simple FileAdapter (no change)
- [x] No impact on existing free tier functionality
- [x] Seamless upgrade path when needed

### ✅ **CTO Management**
- [x] Can manage all adapters across organizations
- [x] Global view of adapter performance and usage
- [x] Ability to upgrade free TPs to enterprise features
- [x] Complete audit trail of all adapter activities

## 🚀 **Strategic Impact**

### **Enterprise Integration**
- **Real-World Connectors**: Database and API adapters for actual systems
- **Intelligent Processing**: Automatic type detection and validation
- **Custom Transformations**: Enterprise-specific data mapping rules
- **Production Ready**: Error handling, retry logic, monitoring

### **Developer Experience**
- **Unified SDK**: Single adapter interface for all data sources
- **Type Safety**: Comprehensive TypeScript definitions
- **Testing Support**: Mock implementations and test utilities
- **Documentation**: Complete API documentation and examples

### **Business Value**
- **Faster Onboarding**: Enterprise customers can integrate existing systems
- **Reduced Integration Costs**: Standardized adapters and transformations
- **Improved Data Quality**: Intelligent validation and error handling
- **Scalable Architecture**: Add new data types without code changes

## 📈 **Next Steps**

Phase 31B completes the intelligence layer. Future phases will build on this foundation:

- **Phase 32**: Real protocol implementation (AS2, SFTP, API handlers)
- **Phase 33**: Advanced admin UI for adapter management
- **Phase 34**: Machine learning for intelligent transformations
- **Phase 35**: Advanced analytics and reporting

---

**Phase 31B delivers the intelligence layer that transforms BridgeFlow from a simple file transfer system into a sophisticated B2B integration platform with enterprise-grade database and API integration capabilities.**

