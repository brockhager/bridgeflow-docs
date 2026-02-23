# Current System: Bridgeflow Control Tower

Status: **Live in production**

Primary URL:
- `https://control-tower.up.railway.app/`

This section documents what is operational today (Phases 56-58).

## Scope

- Public resilience UI served from `bf-control/home`
- Public status API (`GET /api/v1/public/resilience-status`)
- Event ingest API (`POST /api/control/events`)
- Autonomous policy loop with risk scoring and case creation

## Key References

- Architecture: `docs/ARCHITECTURE.md`
- TRL 7 evidence summary: `docs/current/control-tower/trl7-validation.md`
- Public API quick reference: `docs/current/control-tower/public-api.md`
- Integration quickstart: `docs/current/control-tower/integration-guide.md`
- Live screenshot: `docs/images/phase-60-control-tower-home.png`
