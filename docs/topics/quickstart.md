# Developer Quickstart

Use this page if your goal is: "I want to connect my system quickly."

Estimated time: 5-10 minutes.

## Step 1: Get an API Key

Bridgeflow currently provisions integration tokens during onboarding.

- Auth model: `Authorization: Bearer <INTEGRATION_TOKEN>`
- Full onboarding and token details:
`../current/control-tower/integration-guide/`

## Step 2: Send Your First Event

Send a normalized event to the ingest endpoint:
- `POST https://control-tower.up.railway.app/api/control/events`

```bash
curl -X POST "https://control-tower.up.railway.app/api/control/events" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <INTEGRATION_TOKEN>" \
  -d '{
    "event_id": "evt_demo_20260223_0001",
    "tenant_id": "tenant-acme",
    "event_type": "shipment.delayed",
    "source": "customer-wms",
    "occurred_at": "2026-02-23T18:00:00Z",
    "payload": {
      "shipment_id": "SHP-10001",
      "reason": "Port congestion",
      "delay_minutes": 240
    }
  }'
```

## Step 3: View Public Resilience Data

Check the public resilience endpoint:
- `GET https://control-tower.up.railway.app/api/v1/public/resilience-status`

Reference:
- `../current/control-tower/public-api/`

## Event Types You Can Start With

- `shipment.created`
- `shipment.delayed`
- `shipment.delivered`
- `shipment.delivery_failed`
- `shipment.tracking_stale`

## Next

For full schema and integration details:
- `../current/control-tower/integration-guide/`
