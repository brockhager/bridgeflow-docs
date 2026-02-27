# Shipments

BridgeFlow Shipments is the operational product surface for shipment lifecycle execution and visibility.

## Status

Active.

## Endpoint

- https://bf-shipments.up.railway.app

## Core Capabilities

- Shipment creation and updates
- Tracking events and timeline visibility
- Proof of Delivery (POD) upload
- Quote-to-shipment conversion support
- Automated invoice generation trigger on delivery

## Key Routes

- `GET /health`
- `GET /api/v1/shipments`
- `POST /api/v1/shipments`
- `PATCH /api/v1/shipments/{shipment_id}`
- `POST /api/v1/shipments/{shipment_id}/pod`

## Repository

- https://github.com/brockhager/bf-shipments
