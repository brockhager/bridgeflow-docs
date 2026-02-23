# Security Hardening — Phase A (T-045)

Overview
This document captures the Phase A plan for security hardening (Secret Management, mTLS, Rate Limiting/DDoS, Headers/CSP, and Audit prep).

Goals
- Add a secure secret-management abstraction that supports multiple backends (mock, AWS Secrets Manager, Vault).
- Ensure secret access is audited (read/write) and RBAC-protected where relevant.
- Add mTLS support for sensitive endpoints and provide certificate management tooling.
- Harden rate-limiting and add DDoS detection hooks.
- Enforce security headers and a baseline Content Security Policy (CSP).
- Prepare an audit package (checklist, scripts) for security reviewers and the CTO.

Secret Management (first workstream)
- Design
  - `api/lib/secretManager.js` abstraction with methods: `init`, `getSecret(name)`, `setSecret(name, value)`, `listSecrets(prefix)`, `checkSecretBackendHealth()`.
  - Backends via `SECRET_BACKEND` env var: `mock` (default), `aws`, `vault` (stub).
  - Audit secret reads/writes and AWS calls via `writeAudit({ message: 'secret.read'|'secret.write'|'secret.aws.call', meta: { key, actor, op } })`.
  - Secret APIs are RBAC-gated (`secrets:read|write`) and rate-limited by Fastify global limiter.
- Env vars
  - `SECRET_BACKEND` — `mock|aws|vault` (default `mock`)
  - AWS: `AWS_REGION` (required for aws backend), optional `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `AWS_SESSION_TOKEN` (or use IAM role). Optional `AWS_SECRETS_ENDPOINT` for VPC endpoints/localstack (maps to `endpoint`).
  - Vault: `VAULT_ADDR` (required), `VAULT_TOKEN` (token auth), `VAULT_ROLE_ID` + `VAULT_SECRET_ID` (AppRole), optional `VAULT_NAMESPACE`, `VAULT_KV_MOUNT` (default `secret`), `VAULT_KV_VERSION` (default `2`), `VAULT_AUTH_METHOD` (`token|approle`).
- Behavior
  - AWS backend uses `@aws-sdk/client-secrets-manager` with retry on throttling and audit of AWS API calls.
  - Vault backend supports KV v2 (read/write/list) with token or AppRole auth, retries on 429/5xx, and audit of Vault calls.
  - Missing `AWS_REGION` or `VAULT_ADDR` forces a safe fallback to `mock` backend for local dev.
  - Health check: `checkSecretBackendHealth()` issues `ListSecrets` (aws) or `/sys/health` (vault) to confirm connectivity.
- Verification
  - Unit tests for `mock`, AWS, and Vault adapters (mocked SDK/fetch), including retry, health, and fallback behavior.
  - QA: create and fetch a secret in dev, confirm audit logs and RBAC enforcement.

mTLS & Certificate Management
- Add TLS client-auth option to sensitive endpoints (configurable via `REQUIRE_MTLS=true`)
- Add certificate management tooling for generating CSRs and rotating certs

Rate Limiting & DDoS
- Extend rate limiter configuration for IP-based allow/deny lists and per-endpoint policies
- Add simple anomaly detection rules for traffic spikes and trigger alerts

Security Headers & CSP
- Phase 1: HTTP Security Headers (complete) ✅
  - Implemented Fastify plugin (`api/lib/securityHeaders.js`) with OWASP recommended headers
  - Headers: `Strict-Transport-Security` (HSTS), `X-Frame-Options`, `X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy`, `X-XSS-Protection`
  - Content Security Policy (CSP) with environment-aware configuration
  - 16 comprehensive tests covering all headers and environment behavior ✅
- Phase 2: CSP Advanced Features (complete) ✅
  - **Nonce Generation**: Cryptographically secure per-request nonces for inline scripts/styles
  - **Violation Reporting**: POST /api/csp-report endpoint with rate limiting, sanitization, audit logging
  - **Production Hardening**: Removed unsafe-inline/unsafe-eval, added granular directives (script-src-elem, style-src-elem, etc.)
  - **Route-Specific CSP**: Different policies for /admin vs public routes, custom policy support
  - Environment variables:
    - `DISABLE_HSTS` — disable HSTS (default: enabled in production only)
    - `HSTS_MAX_AGE` — HSTS max-age in seconds (default: 31536000 = 1 year)
    - `HSTS_INCLUDE_SUBDOMAINS` — include subdomains in HSTS (default: true)
    - `HSTS_IN_DEV` — enable HSTS in development (default: false)
    - `DISABLE_CSP` — disable CSP entirely (default: false)
    - `CSP_REPORT_ONLY` — CSP report-only mode (default: true in development)
    - `CSP_ENFORCE` — enforce CSP in development (default: false)
    - `CSP_USE_NONCES` — enable nonce generation (default: false, auto-enabled in production with hardened CSP)
    - `USE_PRODUCTION_CSP` — use hardened CSP (default: true in production)
    - `CSP_REPORT_URI` — violation report endpoint (default: /api/csp-report)
    - `X_FRAME_OPTIONS` — X-Frame-Options header value (default: DENY)
    - `REFERRER_POLICY` — Referrer-Policy header value (default: strict-origin-when-cross-origin)
  - Production CSP policy (no unsafe-inline):
    - `default-src 'self'` — only same-origin resources
    - `script-src 'self'` — scripts from same origin only
    - `script-src-elem 'self'` — script elements from same origin
    - `script-src-attr 'none'` — no inline event handlers
    - `style-src 'self'` — styles from same origin only
    - `style-src-elem 'self'` — style elements from same origin
    - `style-src-attr 'none'` — no inline style attributes
    - `img-src 'self' data: https:` — images from same origin, data URIs, HTTPS
    - `connect-src 'self'` — API calls to same origin
    - `font-src 'self' data:` — fonts from same origin or data URIs
    - `object-src 'none'` — no plugins
    - `base-uri 'self'` — prevent base tag injection
    - `form-action 'self'` — prevent form hijacking
    - `frame-ancestors 'none'` — prevent framing
    - `upgrade-insecure-requests` — upgrade HTTP to HTTPS
  - Admin route CSP (more restrictive):
    - No external images (`img-src 'self' data:` only)
    - No external scripts or styles
    - No external fonts
  - CSP violation reporting:
    - Rate-limited endpoint (100 reports/minute)
    - Sanitization (truncate long values, filter unexpected fields)
    - Audit logging with severity classification
    - Console logging in development
  - Tests: 19 tests total (16 baseline + 3 production CSP) ✅
  - Documentation: Complete implementation guide with examples ✅

Audit Prep
- Prepare a security audit checklist and scripts
- Run static analyzer + dependency vulnerability scans and record results

Acceptance Criteria
- Secret manager abstraction implemented with `mock` backend and tests ✅
- Secret access audit entries emitted on read/write ✅
- Documentation added to `docs/Layer4-PlatformCoreLayer/Security-Hardening.md` and `Deployment-Guide.md` ✅
- AWS Secrets Manager adapter with retry, health check, audit logging ✅
- Vault adapter with token/AppRole auth, KV v2 support, audit logging ✅
- Admin UI for secrets management with RBAC integration, masked values, accessibility ✅
- Security headers plugin with OWASP recommended headers (HSTS, X-Frame-Options, CSP, etc.) ✅
- Environment-aware header configuration with CSP report-only mode in development ✅
- 16 comprehensive tests for security headers covering all directives and environment behavior ✅
- CSP advanced features: nonce generation, violation reporting, production hardening, route-specific policies ✅
- CSP violation reporting endpoint with rate limiting and audit logging ✅
- Production CSP hardened (no unsafe-inline/unsafe-eval, granular directives) ✅
- 19 total CSP tests (16 baseline + 3 production CSP passing) ✅
- Complete CSP implementation documentation with usage examples ✅
- mTLS and rate-limiting enhancements scoped and scheduled for implementation ✅

## Network Boundary Protection (Phase 33)

All firewall configurations are restricted to **Layer 4 public endpoints only**:

- **Private IP ranges blocked**: `10.0.0.0/8`, `172.16.0.0/12`, `192.168.0.0/16`, `127.0.0.0/8`
- **Port validation**: Only ports 1-65535 accepted
- **Protocol enforcement**: TCP/UDP/BOTH only

> 🔒 **Never store internal topology** — firewall data is strictly for partner coordination.

**References:**
- Firewall API validation: [`api/validators/firewall.js`](../../api/validators/firewall.js)
- Complete specification: [Phase 33 Firewall API](../phases/phases31-40/phase-33-firewall-api.md)
- Canvas integration guide: [Phase 33 Canvas Integration](../phases/phases31-40/phase-33-firewall-canvas-integration.md)

---

Next steps
1. ~~Implement `api/lib/secretManager.js` (mock + interface) and tests~~ — complete
2. ~~Add audit writes and RBAC checks for secret access~~ — complete
3. ~~Add adapters for `aws` and `vault`~~ — complete
4. ~~Build Admin UI for secrets management~~ — complete
5. ~~Implement Security Headers & CSP (Phase 1)~~ — complete
6. ~~Complete CSP Phase 2 (nonce support, violation reporting, production hardening, route-specific policies)~~ — complete
7. Implement mTLS support for sensitive endpoints
8. Add rate-limiting enhancements (IP allow/deny lists, anomaly detection)
9. Prepare security audit package (checklist, vulnerability scans, static analysis)

