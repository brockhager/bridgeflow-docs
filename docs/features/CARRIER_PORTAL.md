# CARRIER PORTAL

`bf-carrier-portal` is the carrier-facing web UI for shipment execution visibility.

## Access and Session Flow

- JWT intake from identity redirect via URL token.
- Local authenticated session persistence.
- Automatic redirect to identity login when unauthenticated.

## Shipment Views

- My Shipments list with periodic auto-refresh.
- Shipment detail route per shipment ID.

## Current State

- Shipment detail page is scaffolded and marked for timeline/status/POD expansion.
