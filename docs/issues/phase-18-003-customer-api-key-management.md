# [Phase 18] Customer API Key Management

**Summary:** Create a secure API key lifecycle and per-organization rate limiting for customer ingestion and endpoint access.

Scope
- Generate / rotate / revoke customer API keys (use HSM-friendly hash for storage)
- Rate limiting per customer organization (Redis-backed token bucket)
- Admin dashboard endpoints for key management and audit logs

Acceptance criteria
- Prisma model `customer_api_key` with id, orgId, keyHash, createdAt, rotatedAt, revokedAt, metadata
- API endpoints to create/list/rotate/revoke keys (handler-level unit tests)
- Rate limiter middleware that enforces per-org quotas with Redis; unit tests and a CI E2E test

Owners: Agent4 (schema & endpoints), Agent10 (Redis rate-limiting), CTO (security review)

Notes
- Use `crypto.timingSafeEqual` on server for verifying key hashes when needed, and ensure keys are never logged
- Plan for rotation without downtime (issue new key, accept both old/new for short transition window)
