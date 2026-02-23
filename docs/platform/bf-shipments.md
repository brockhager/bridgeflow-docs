# Service: bf-shipments

## Purpose

Shipment state, tracking events, POD upload, and shipment read/write APIs.

## API Endpoint

- Common base reference in workspace code: `https://bf-shipments.up.railway.app`
- Core endpoints:
  - `GET /health`
  - `GET /api/shipments`
  - `GET /api/shipments/{shipment_id}`
  - `POST /api/shipments`
  - `PATCH /api/shipments/{shipment_id}`
  - `POST /api/shipments/{shipment_id}/pod`

## Status

Active.

## Repository

- `https://github.com/brockhager/bf-shipments`
