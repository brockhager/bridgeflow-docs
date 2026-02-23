# Bridgeflow Live Architecture (Phases 56-58)

Last updated: February 23, 2026

## 1. System Reality

Bridgeflow currently runs as a live control tower centered on `bf-control`.

Production endpoint:
- `https://control-tower.up.railway.app`

This single deploy serves:
- Public web interface (`/`, `/home`) from static assets built from `bf-control/home/`
- Public status API (`/api/v1/public/resilience-status`)
- Ingestion and case APIs (`/api/control/*`)
- Background jobs (live weather ingest + escalation watcher)

## 2. Runtime Components

### 2.1 `bf-control` FastAPI app

Core responsibilities:
- Event ingest and normalization (`POST /api/control/events`)
- Policy/risk evaluation
- Case lifecycle management (`/api/control/cases*`)
- Public resilience projection (`GET /api/v1/public/resilience-status`)
- Static frontend serving for public map/feed (`/`, `/home`)

### 2.2 Background jobs

- Live weather ingest loop (Lima pilot / OpenWeatherMap)
- Escalation watcher loop (SLA breach detection)

Both run in-process via FastAPI lifespan startup.

### 2.3 Data plane

Primary stores in Postgres:
- `events`
- `cases`
- `risk_states`
- `action_requests`

Isolation model:
- tenant-scoped processing keyed by `tenant_id`
- idempotency on inbound events via `(tenant_id, event_id)`

## 3. Public Web + API Surface

### Public UI (no login required)

- `GET /`
- `GET /home`

Displays:
- Callao map marker with risk-driven color
- weather snapshot
- anonymized recent activity feed

### Public status API

- `GET /api/v1/public/resilience-status`
- Rate limit: `PUBLIC_API_RATE_LIMIT` (default `60` req/min/IP, in-memory per instance)
- Error model includes structured JSON for `429`/`500`

### Ingestion API

- `POST /api/control/events`
- Normalized envelope:
  - `event_id`
  - `tenant_id`
  - `event_type`
  - `source`
  - `occurred_at`
  - `payload`

## 4. Deployment Model

Railway deploy:
- Service: `bf-control`
- Builder: Dockerfile
- Multi-stage build:
  - Node stage compiles `home/` static assets
  - Python stage runs FastAPI and serves compiled assets

Health endpoint:
- `GET /health`

## 5. TRL 7 Validation Anchor

Validated live loop milestone:
- Date: February 20, 2026
- UTC evidence chain:
  - `conditions_updated`
  - `POLICY_TRIGGERED`
  - `RISK_SCORE_UPDATED`
  - `CASE_CREATED`
- Outcome: autonomous case creation with 4-hour SLA

Reference:
- `bf-control/docs/phases51-60/README.md` (Phase 56 section)

## 6. Phase 59+ Architecture Direction

Planned extensions:
- `bf-connect` service for integration credential and webhook management
- adapter library for ERP/WMS/TMS systems
- developer portal for self-service onboarding

Current architecture remains production-safe for:
- public visibility
- inbound normalized events
- tenant-scoped policy execution
