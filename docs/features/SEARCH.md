# SEARCH

`bf-search` provides indexed lookup and query endpoints over operational data.

## Search APIs

- Authenticated query endpoint (`GET /search`).
- Structured search response payloads.

## Ingestion Pipeline

- Startup ingestion routine to build or refresh index data.
- Admin-triggered ingest endpoint (`POST /admin/ingest`).

## Security and Health

- Bearer-token validation on protected endpoints.
- Health endpoint for service monitoring.
