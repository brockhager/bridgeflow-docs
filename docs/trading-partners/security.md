# Security & RLS for Trading Partners

Role-based access control
- Admin actions (create/revoke partners) require appropriate admin permissions and are protected by RBAC (`requirePermission('admin:partners:manage')`).

Row-level security (RLS)
- All TP read/write operations enforce organization scoping via the request `customerOrgId` or equivalent context set by `validateCustomerApiKey` or admin impersonation middleware.
- When writing any TP-related row ensure `organizationId` equals the requesting org to satisfy RLS policies.

API Keys
- Customer API keys are stored via `CustomerApiKey` model (keyHash etc.).
- Partner API keys are stored as sha256 hashes in `PartnerApiKey.key` and cannot be retrieved; only the raw key is shown at creation time.
- Always send partner keys in `X-Partner-Key` header for partner-facing endpoints.

Sensitive credentials
- Integration credentials (OAuth tokens) are encrypted and stored in `IntegrationCredential.encryptedData`. Use `api/lib/crypto.js` helpers to encrypt/decrypt.
- Avoid exposing decrypted tokens in logs, and avoid sending secrets to the client. Only display non-sensitive metadata (e.g., realmId) where necessary.

Operational guardrails
- The admin UI and public UI intentionally do not display full logs or tokens; the **Go to Logs** button is a disabled placeholder.
- Validate inbound payloads strictly and use idempotency headers to avoid duplicated processing.