# Rate Limiting & DDoS Plan

## Goals
- Redis-backed global/route rate limits with in-memory fallback for tests/local.
- IP allow/deny (single IP or CIDR), dynamic blocks from anomaly detection, admin controls to view/unblock.
- Standard `RateLimit-*` + legacy `X-RateLimit-*` headers on all limited routes.
- Anomaly rules: excessive 404s (>20/min per IP) and auth failures (>10/min on /api/auth/*). Offenders auto-blocked with TTL.
- Admin UI (reuse admin pages) to inspect blocks and manage allow/deny entries.

## Components
- **RateLimitManager** (new): wraps store, allow/deny checks, anomaly tracking, dynamic blocks. Exposes Fastify hooks and plugin options.
- **Store selection**: `ioredis` client when `REDIS_URL` (or host/port) is set; otherwise in-memory map. Both expose counters, sets (allow/deny), and block registry with TTL.
- **Fastify plugin config**: global=true, defaults 100 req/min; env overrides `RATE_LIMIT_GLOBAL_MAX`, `RATE_LIMIT_GLOBAL_WINDOW`. Uses custom `allowList` + `keyGenerator` to respect CIDR allowlist and dynamic blocks.
- **Headers**: enable `RateLimit-Limit`, `RateLimit-Remaining`, `RateLimit-Reset`, `X-RateLimit-*` for legacy, plus `Retry-After` on block.

## Policy
- **Global**: per-IP (post-normalization) unless allowlisted.
- **Per-route**: existing auth/webhook limits kept; route configs can override max/window/key.
- **Allow/Deny**: static via env (`RATE_LIMIT_ALLOW_LIST`, `RATE_LIMIT_DENY_LIST`, comma-separated IP/CIDR); dynamic via admin API (stored in store sets).
- **Blocks**: anomaly-triggered blocks stored with reason, ttl, and firstSeen; enforced at `onRequest` before Fastify handlers.

## Anomaly Detection
- Hook on response to record patterns:
  - 404 bursts: key `anomaly:404:<ip>`; threshold 20/min (env `RATE_LIMIT_404_THRESHOLD`, `RATE_LIMIT_404_WINDOW`), block TTL default 15m (`RATE_LIMIT_BLOCK_TTL`).
  - Auth failures: status 401 on `/api/auth/*`; key `anomaly:authfail:<ip>`; threshold 10/min (env `RATE_LIMIT_AUTHFAIL_THRESHOLD`, `RATE_LIMIT_AUTHFAIL_WINDOW`), block TTL default 30m.
- When threshold exceeded, add block entry `{ reason, ttlSeconds, until }` and log event.

## Admin Surface
- **API** under `/api/rate-limits` (mTLS + auth + permission):
  - `GET /status` → config + active blocks + allow/deny lists + backend type (redis|memory).
  - `POST /allow` `{ cidr }`, `DELETE /allow/:cidr`
  - `POST /deny` `{ cidr }`, `DELETE /deny/:cidr`
  - `DELETE /blocks/:ip` → unblock.
- **UI**: new admin page listing backend, current limits, allow/deny entries, active blocks, and quick actions (allow, deny, unblock). Uses existing admin styling/components.

## Environment Surface
- `REDIS_URL` or `REDIS_HOST`/`REDIS_PORT` for backend; fallback to memory when absent or failing.
- `RATE_LIMIT_GLOBAL_MAX` (default 100), `RATE_LIMIT_GLOBAL_WINDOW` (default 1 minute).
- `RATE_LIMIT_ALLOW_LIST`, `RATE_LIMIT_DENY_LIST` (comma-separated IP or CIDR).
- Anomaly tunables: `RATE_LIMIT_404_THRESHOLD` (default 20), `RATE_LIMIT_404_WINDOW` (60s), `RATE_LIMIT_AUTHFAIL_THRESHOLD` (10), `RATE_LIMIT_AUTHFAIL_WINDOW` (60s), `RATE_LIMIT_BLOCK_TTL` (900s default for 404, 1800s for auth failures unless overridden per rule).

## Testing Strategy
- Use in-memory store for Vitest by omitting Redis env.
- Set tiny thresholds/windows in tests (e.g., global=2) to hit limits quickly.
- Assertions: headers present, allowlist bypass, denylist 403/429, anomaly triggers block, route-specific limits still apply, admin endpoints mutate sets/blocks.
