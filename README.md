# Bridgeflow Documentation

Bridgeflow documentation is now organized as a phased narrative:

- **Today (Live):** Bridgeflow Control Tower is operational in production.
- **Tomorrow (Vision):** BF-INTEGRATION remains the long-term enterprise runtime architecture.

Phase 60 objective is to document both clearly without deleting historical design work.

## Today: Current System (Live)

As of February 20, 2026:
- Phase 56 TRL 7 live-loop validation is complete.
- Phase 57 public backend API is complete.
- Phase 58 public frontend is complete and served by `bf-control`.

Live endpoints:
- Control Tower UI: `https://control-tower.up.railway.app/`
- Public resilience API: `GET /api/v1/public/resilience-status`
- Event ingest API: `POST /api/control/events`

Start here:
- `docs/current/control-tower/README.md`
- `docs/ARCHITECTURE.md`

## Tomorrow: Future Vision (BF-INTEGRATION)

Legacy and roadmap architecture content is preserved and being re-indexed as planned/future material, not removed.

Future-vision index:
- `docs/roadmap/future-architecture/README.md`

## Phase 60 Tracking

- Gap analysis and update plan: `docs/phase-60-gap-analysis.md`

## Hosting Recommendation

Recommended immediate public hosting: GitHub Pages, then optional custom domain once structure stabilizes.
