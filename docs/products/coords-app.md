# Product: Coords App

## Purpose

Coords App is a separate Bridgeflow-umbrella application focused on spatial identity and logistics coordination.

It supports the BF system with:
- open coordinate protocol specification
- reference CLI encoding/decoding tools
- hosted resolver and coordination APIs

## Workspace Location

- `c:\bridgeflow-core\coordsapp`

## Structure

- `spec/`: open protocol spec (CC0) and feature docs
- `core/`: Go reference CLI for protocol encode/decode
- `cloud/`: hosted resolver API, alias registry, and coordination runtime

## Status

Active development under BF umbrella.

## Primary Endpoint

- `https://coords.up.railway.app` (referenced in `coordsapp/cloud/README.md`)

## Notable API Surface (`cloud`)

- Resolver: `GET /v1/resolve/{handle}`
- Auth: `POST /v1/auth/signup`, `POST /v1/auth/token`
- Status: `GET /v1/status/public`
- Coordination:
  - `POST /v1/routing/plan`
  - `POST /v1/coordination/assign-dock`
  - `GET /v1/coordination/docks/{id}/status`
