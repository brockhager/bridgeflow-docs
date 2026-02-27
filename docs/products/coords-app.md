# Coords App

Coords App is a BridgeFlow umbrella product focused on spatial identity and logistics coordination.

## What It Provides

- Open coordinate protocol specification
- Reference CLI tooling for encode/decode
- Hosted resolver and coordination APIs

## Workspace Layout

- `spec/` protocol and feature docs
- `core/` Go reference CLI
- `cloud/` resolver API and coordination runtime

## Runtime Status

Active development.

Primary endpoint: https://coords.up.railway.app

## Key Cloud Endpoints

- Resolver: `GET /v1/resolve/{handle}`
- Auth: `POST /v1/auth/signup`, `POST /v1/auth/token`
- Public status: `GET /v1/status/public`
- Routing: `POST /v1/routing/plan`
- Dock assignment: `POST /v1/coordination/assign-dock`
- Dock status: `GET /v1/coordination/docks/{id}/status`
