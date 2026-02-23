# Ports Reservation — BridgeFlow

Purpose
-------
This document records the TCP ports reserved for local development, CI, and demos to avoid collisions and keep conventions consistent across environments.

Guidelines
----------
- Use these ports in local Docker run commands, dev servers, and CI job mappings.
- Avoid reusing these ports on the same host. If a service needs a different port, update this file and the relevant documentation/config.
- In CI or containerized environments prefer ephemeral host ports or container port mapping when multiple jobs run in parallel.

Reserved Ports
--------------

| Service | Port | Purpose / Notes |
| --- | ---: | --- |
| Mail (MailHog / SMTP debug) | 1025 | Local development SMTP capture (MailHog default). |
| Web UI (static demo) | 3000 | Static server used for `web/` prototype (npx http-server web -p 3000). Keep this free for demos. |
| Grafana (optional) | 3001 | Reserved for local Grafana instance (avoid colliding with 3000). |
| API Server (Fastify) | 4000 | Local API dev server for orchestrator endpoints (POST /api/jobs). |
| PostgreSQL | 5432 | Default Postgres port (used for local test DB). Default container mapping: -p 5432:5432 |
| Redis (queues) | 6379 | Default Redis port for queue/backplane (BullMQ, etc.) |
| Prometheus | 9090 | Metrics scraping endpoint for monitoring in dev/staging. |
| Node Inspector / Debug | 9229 | Node debugger (avoid starting multiple processes with same debug port). |

Notes & Recommendations
-----------------------
- If running multiple environments (e.g., several local demos), use container port mapping to avoid host port collisions (e.g., -p 15432:5432). Document the alternate mapping alongside the demo instance if needed.
- CI jobs should not assume host ports are available across parallel runs; use the service containers provided by the runner (or random host ports) and pass explicit connection strings via environment variables.
- Add new entries to this file when introducing new long-running services (e.g., message broker, observability components). Keep entries short and precise.

Contact
-------
If you need a port reserved for an integration or demo, open a short issue or pull request updating this file with the service name and justification so the team can approve and avoid conflicts.
