# Product: Bridgeflow Control Tower

The Control Tower is Bridgeflow's current live product for resilience monitoring and policy-driven response.

Live deployment:
- [https://control-tower.up.railway.app/](https://control-tower.up.railway.app/)

## What It Includes Today

- Public resilience map and activity feed.
- Public status API (`GET /api/v1/public/resilience-status`).
- Event ingestion API (`POST /api/control/events`).
- Autonomous policy loop: Event -> Policy -> Risk -> Case.

## Start Here

- Quickstart: `quickstart/`
- Concepts: `concepts/`
- API details: `public-api/`
- Integration setup: `integration-guide/`
- Validation evidence: `trl7-validation/`
