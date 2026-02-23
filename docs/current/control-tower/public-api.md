# Public API (Current)

Base URL:
- `https://control-tower.up.railway.app`

## 1. Public Resilience Status

- **Endpoint:** `GET /api/v1/public/resilience-status`
- **Auth:** None
- **Rate limit:** `PUBLIC_API_RATE_LIMIT` (default 60 req/min/IP)
- **Purpose:** Public-safe resilience snapshot (redacted fields only)

### Response shape

```json
{
  "system_health": "OPERATIONAL",
  "current_risk_level": "LOW",
  "last_update_utc": "2026-02-20T04:20:50Z",
  "weather": {
    "wind_speed_kmh": 24.08,
    "temperature_c": 24.98,
    "conditions": "Clouds"
  },
  "recent_activity": [
    {
      "event_type_public": "Autonomous Case Created",
      "occurred_at_utc": "2026-02-20T04:20:50Z"
    }
  ]
}
```

### Error model

```json
{
  "error": "RATE_LIMIT_EXCEEDED",
  "message": "Too many requests. Please try again in 1 minute.",
  "retry_after": 60
}
```

## 2. Event Ingestion API

- **Endpoint:** `POST /api/control/events`
- **Auth:** Bearer token integration model (see integration guide)
- **Purpose:** Tenant-scoped normalized event ingest for policy/case processing

Request envelope:

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
