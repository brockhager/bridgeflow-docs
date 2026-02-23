# Layer 2 — Connection Layer (Connectors & Endpoints)

**Purpose:** Layer 2 handles protocol-specific delivery and the operational concerns of connecting to external trading partners (AS2, SFTP, API, SMTP, etc.). It is responsible for credential management, retries, rate limiting, and converting standardized BridgeFlow packages into transport-specific payloads.

Key responsibilities
- Credential storage and encryption (IntegrationCredential model)
- Token refresh and secure handling for external services
- Protocol adapters (AS2, SFTP, API, Email) with consistent retry and backoff behaviors
- Queueing/enqueuing interface for Layer 3 packages (e.g., pushing to `raw_payloads` or package delivery queues)
- Observability: metrics, delivery status, and retry tracking

Examples & references
- QuickBooks Online Connector: `qbo-connector.md` (OAuth flow, token encryption, sync lifecycle)
- Implementation files: `api/lib/*Connector*`, `workers/*-connector-worker.js`, `api/handlers/*` (connector-related handlers)

Operational behavior
- Each connector enforces per-organization rate limits and cooperative idempotency (avoid duplicate sends).
- Connectors persist delivery state (Package → DeliveryJob → Transaction) for retry and auditability.
- Administrative routes for connector management exist under admin APIs (require appropriate RBAC permissions).

Security & compliance
- Credentials encrypted at rest (AES-256-GCM or Vault-backed secret store)
- Restricted APIs for credential rotation and inspection (RBAC enforced)

Phase 40 — Connection Reliability & Security (Jan 13, 2026)
- Introduced connection health models (`ConnectionHealth`, `ConnectionEvent`, `ConnectionTest`, `RecoveryAction`).
- Added runtime API routes: health, events, test, retry + `/connections` dashboard for self-service diagnostics.
- Credential Security: Startup-enforced Vault compliance via `api/lib/credentialSecurity.js`; protocol handlers (SFTP, AS2, API) now fetch credentials via Vault helpers (`fetchSftpCredentials`, `fetchAs2Credentials`, `fetchApiCredentials`). Production startup will be blocked if any handler is not Vault-compliant.

Testing & validation
- Connector unit tests: client refresh, error handling, mapping
- Integration tests: mock remote endpoints, simulate retries and failure modes

Where to learn more
- `qbo-connector.md` — QBO-specific connector lifecycle and recommendations
- Phase docs related to Layer 2: `docs/phases/phases31-40/phase-30.md` (Layer 2 Implementation)

_Last updated: Jan 13, 2026_