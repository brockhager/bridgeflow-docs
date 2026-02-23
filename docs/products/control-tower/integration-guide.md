# Control Tower Integration Guide

This guide explains how to push private ERP/WMS/TMS events into Bridgeflow Control Tower.

## Endpoint

- `POST https://control-tower.up.railway.app/api/control/events`

## Authentication

- Header: `Authorization: Bearer <INTEGRATION_TOKEN>`
- Token provisioning: manual Bridgeflow onboarding flow

## Required Envelope

```json
{
  "event_id": "evt_erp_20260223_0001",
  "tenant_id": "tenant-acme",
  "event_type": "shipment.created",
  "source": "sap-s4",
  "occurred_at": "2026-02-23T00:30:00Z",
  "payload": {
    "shipment_id": "SHP-10001"
  }
}
```

## Common Event Types

- `shipment.created`
- `shipment.delayed`
- `shipment.delivered`
- `shipment.delivery_failed`
- `shipment.tracking_stale`

## cURL Example

```bash
curl -X POST "https://control-tower.up.railway.app/api/control/events" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <INTEGRATION_TOKEN>" \
  -d '{
    "event_id": "evt_erp_20260223_0001",
    "tenant_id": "tenant-acme",
    "event_type": "shipment.delivered",
    "source": "sap-s4",
    "occurred_at": "2026-02-23T09:10:00Z",
    "payload": {
      "shipment_id": "SHP-10001",
      "promised_delivery_at": "2026-02-23T08:00:00Z",
      "delivered_at": "2026-02-23T09:10:00Z"
    }
  }'
```
