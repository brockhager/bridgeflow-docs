# Control Tower Quickstart

Goal: connect your system and send your first event in 5-10 minutes.

## Step 1: Get an API Key/Token

Bridgeflow currently provisions integration tokens during onboarding.

- Auth header: `Authorization: Bearer <INTEGRATION_TOKEN>`
- Full onboarding details: `integration-guide/`

## Step 2: Send Your First Event

Ingest endpoint:
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

## Step 3: Verify Public Status Output

Query the public status endpoint:

- `GET https://control-tower.up.railway.app/api/v1/public/resilience-status`

Reference:
- `public-api/`
