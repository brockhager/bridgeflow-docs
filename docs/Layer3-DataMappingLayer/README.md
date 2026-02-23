# Layer 3 — Data Mapping & Exchange Layer

**Status:** Foundation Complete (Phase 31A & 31B); Mapping Studio & Profile Templates Complete (Phase 34 & 35)
**Focus:** Ingestion, intelligent parsing, schema-driven mapping, and package creation for downstream delivery

Quick summary
- Layer 3 accepts data from customer systems (files, APIs, DBs), detects/validates content, transforms it using mapping templates, and emits standardized BridgeFlow *packages* consumed by Layer 2 connectors.
- Key goals: universal ingestion, intelligent detection, repeatable mappings (templates), enterprise-grade security, and scale.

Core components
- Adapter Framework (BridgeFlowAdapter / BaseAdapter): unified interface for onramp/offramp adapters and symmetric deployment across tiers.
- TypeDetector & DataTypeRegistry: multi-strategy detection and a registry of supported data-types (X12, JSON, CSV, XML, custom formats).
- Parser & Validation Engine: pluggable parsers and rule-based validation with confidence scoring.
- Mapping Studio & Templates: visual mapping editor (Mapping Studio) and versioned Profile Templates for reuse and auto-apply.
- Transformation Pipeline: rule functions, templates, and error handling with detailed diagnostics.

Supported data types (examples)
- EDI (X12: 850, 810, 856, 945, 210, 820, 997)
- JSON (generic, POS, API responses)
- CSV (generic, domain-specific like claims)
- XML (generic, HL7)
- Custom / Legacy formats (user-defined parsers)

Key behaviors & principles
- Symmetric adapter model: same binary and interface for free and enterprise tiers; features gated by token permissions.
- One codebase, unified deployment, token-based capability gating (no forked code paths).
- Mapping Studio provides near-real-time preview and pre-save validation endpoints (e.g., `POST /api/data-types/transform`).
- Template model (`MappingTemplate`) supports `version`, `dataTypeCode`, `validationStatus`, and `isEnterprise` flags.

Integration points
- Layer 2 (Connectors): Layer 3 produces standardized packages that Layer 2 delivers using protocol connectors (AS2, SFTP, API, etc.).
- Layer 4 (Platform Core): Package management, tenet application, monitoring and metrics integration.
- Layer 5 (Infra & Org): Tenant isolation, encrypted credentials, and permission scoping.

Security & compliance
- Multi-tenant isolation and RLS enforced at DB level.
- Encrypted credential storage and secure credential retrieval for adapters (Vault integration available).
- Permission scoping per adapter and token-based access control with audit logging.
- Compliance support (HIPAA, PCI-DSS, GDPR) available via validation and secure connectors.

Performance & scaling
- Designed for high throughput: horizontal scaling, connection pooling, and caching for common schemas.
- Real-time processing with options for batch/streaming modes.
- Observability: health checks, processing metrics, error dashboards, and tracing.

Developer & operator notes
- Implementation references: `api/adapters.md`, `intelligence/data-types.md`, `intelligence/transformations.md`.
- Mapping Studio frontend: `web/mapping-studio/` (studio.js, templates.js).
- API endpoints: `/api/data-types/*`, `/api/templates/*`, and mapping preview/validation endpoints.

Where to learn more
- Phase docs: `docs/phases/phases31-40/phase-31A.md` (Adapter Framework), `phase-31B.md` (Document Intelligence), `phase-34-summary.md` (Mapping Studio), `phase-35-summary.md` (Profile Templates)
- Implementation: `api/adapters.md`, `api/handlers/` (mapping/transform handlers), and transformation guides under `docs/guides/transformations.md`.

Contact & ownership
- Layer owner: Platform/Core team (see `docs/ONBOARDING.md` for contacts)
- For schema or mapping questions, file an issue or reach out to the team listed in the Phase docs.

_Last updated: Jan 12, 2026_