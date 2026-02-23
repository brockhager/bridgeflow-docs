# Credential Security & Vault Enforcement

**Purpose:** Describe startup-enforced credential security introduced in Phase 40 and provide runbook guidance for production rollout.

## Overview
Phase 40 introduced a credential security enforcer that ensures all protocol handlers retrieve credentials exclusively from the configured secret backend (Vault). This prevents accidental plaintext credentials and enforces a consistent, auditable secret retrieval path.

Key components
- `api/lib/credentialSecurity.js` — Core enforcement module
  - `registerHandler(handlerName, config)` — Register a protocol handler to be tracked
  - `markVaultCompliant(handlerName)` — Mark handler as compliant (called when handler successfully fetches/uses Vault secrets)
  - `fetchSftpCredentials`, `fetchAs2Credentials`, `fetchApiCredentials` — Protocol helpers to resolve credential batches from Vault
  - `enforceVaultCompliance()` — Throws when non-compliant handlers exist (called during startup enforcement)
- `api/launcher.js` — Calls `enforceCredentialSecurity()` during startup and will block production startup if handlers are non-compliant

## Production Runbook
1. Configure Vault and set env vars: `SECRET_BACKEND=vault`, `VAULT_ADDR`, `VAULT_TOKEN` (or configure a proper auth backend)
2. Ensure all protocol handlers call the credential helpers (`fetch*Credentials`) or explicitly call `markVaultCompliant()` during configuration/test paths
3. Start server with production env: `NODE_ENV=production START_SERVER=true pnpm run api:start` — startup will block when any handler is non-compliant
4. If deployment blocks, inspect startup logs for the list of non-compliant handlers and remediate code to use the Vault helpers

## Notes & Tips
- In development, non-compliance logs a warning but does not block startup (to avoid breaking local workflows). In production, enforcement is strict.
- Keep credential Vault paths consistent using `getCredentialPath(organizationId, connectorId, credentialType)` (e.g., `organizations/{org}/connectors/{connector}/{type}`)
- Add unit/integration tests that assert handlers call Vault helpers or that call `markVaultCompliant()` when appropriate

## Troubleshooting
- `Error: handler(s) missing Vault integration: SFTP, AS2`: The handler registration exists, but the handler never called `markVaultCompliant()`; ensure credential fetch occurs during test or configuration paths.
- `Vault connectivity errors`: Verify `VAULT_ADDR` and `VAULT_TOKEN` or service role authentication; use `api/lib/secretManager.js` to mock or inspect behaviour during local development.

---

*For operational questions, consult the Launcher logs during startup — they will report registered handlers and clear instructions when enforcement fails.*