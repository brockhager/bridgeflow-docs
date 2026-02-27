# Shipments Service (`bf-shipments`)

Shipment lifecycle, tracking events, POD handling, and dispatch-facing APIs.

## Status

Active.

## Endpoint

- https://bf-shipments.up.railway.app

## Key Routes

- `GET /health`
- `GET /api/shipments`
- `GET /api/shipments/{shipment_id}`
- `POST /api/shipments`
- `PATCH /api/shipments/{shipment_id}`
- `POST /api/shipments/{shipment_id}/pod`

## Security Boundary

- `bf-shipments` owns TMS operational workflows.
- Platform-level impersonation and platform audit logging are owned by `bf-identity`.
- Admin Console routes privileged platform-security operations to Identity.

## Repository

- https://github.com/brockhager/bf-shipments
