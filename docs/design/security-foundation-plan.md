# Security Foundation Plan (Draft)

Goal: Implement practical, high-impact security controls now and design for stronger enterprise features later (SOC2/GDPR-ready). This doc outlines what to build now vs. what to design for.

## Immediate (Build Now)
- TLS everywhere: enforce HTTPS for all public endpoints; internal services talk TLS when possible
- Secrets management: `@bridgeflow/lib-secrets` abstraction; prod uses AWS Secrets Manager + KMS
- Logging & audit: structured logs with `requestId`, `tenantId`; `audit-service` records immutable audit events (7-year retention policy)
- RBAC & least privilege: role model for admin actions; enforce via middleware
- Dependency scanning: enable Dependabot + CodeQL scans and SCA tools in CI
- Key management: use provider KMS (AWS KMS) for data-encryption keys; rotate keys on schedule
- Secure defaults: strict Content Security Policy for UIs; secure HTTP headers via middleware

## Design-For (Prepare hooks / extend later)
- Field-level encryption primitives for highly sensitive fields (PII) — design db helpers and API for encryption-at-rest using envelope keys
- mTLS service-to-service auth — design certificate lifecycle API (use cert manager or AWS ACM)
- Per-tenant CMK option — allow tenants to supply a KMS key identifier for advanced customers (design scoping now)
- WORM storage for audit logs (cold archive with immutability guarantees) — design archiver component

## Audit Logging - Details
- Events to capture (initial set): tenant.create, tenant.delete, tenant.update, user.create, user.delete, permission.change, secret.access, migration.start, migration.complete
- Write path: synchronous append to `audit-service` (fast path) with async replication to cold storage for long-term retention
- Retention: 7 years for audit events; move to encrypted cold storage after N days
- Querying: admin-only query endpoints with RBAC; export endpoints for evidence collection

## Encryption at Rest
- Database: enable provider-managed encryption at rest for RDS/managed Postgres
- Column-level / field-level: build an application layer `encryptField`/`decryptField` helper in `lib-secrets` for field-level encryption when required
- Key management: KMS keys & rotation; audit key usage

## Encryption in Transit & Certificate Management
- External: TLS with provider-managed certificates (e.g., AWS Application Load Balancer + ACM)
- Internal (optional immediate): use A/B encryption for sensitive traffic; long-term: mTLS across service mesh if we adopt one
- Certificate rotation: automate via provider tooling or cert-manager for k8s

## API Security & DDoS
- API Gateway enforces rate limits and per-tenant quotas
- Use WAF (cloud provider feature) to mitigate common web attacks and bots
- Implement RBAC & token expiration; rotate keys and monitor anomalies

## Secrets & Key Rotation
- Use Secrets Manager + KMS; wrap getSecret with audit events
- Rotation: schedule key rotation via KMS lifecycle; ensure application code supports re-fetching rotated keys without restarts (cache TTL)

## Logging & Observability
- All logs structured JSON, include tenantId/requestId/principal
- Use OTEL: traces should propagate request and tenant info
- SLOs: document expected latency; integrate alerts for high error rates and tenant-impacting issues

## CI/CD & Secure Build
- Build pipeline: lock down node versions, dependency pinning, CodeQL and SCA scans
- Container scanning (if images used): run image scanners; fail build on high severity findings
- Secrets: do not store secrets in CI; use secrets store integrations (GH Secrets, Vault)

## Incident Response & IR Runbooks
- Document key runbooks: key compromise, data-leak, audit-evidence requests, restore tests
- Test restore & DR playbooks annually or with major change

## Compliance & Evidence
- Build evidence capture into release processes (artifact storage, migration logs, access logs)
- Maintain mapping of requirements (SOC2/GDPR) to implemented controls and owners

---

Next steps
1. Implement `lib-secrets` with local dev shim and prod AWS Secrets Manager implementation
2. Implement `lib-audit` server that accepts immutable writes and offloads to encrypted, cold storage
3. Add PR templates and `security-checklist.md` to enforce security review
4. Plan for field-level encryption RFC and tenant-CMK requirements once an enterprise customer needs it
