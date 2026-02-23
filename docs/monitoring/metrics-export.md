# Metrics Export & Monitoring

## Enabling Metrics
```bash
# Environment variable
EXPOSE_METRICS=true

# Kubernetes deployment
env:
- name: EXPOSE_METRICS
  value: "true"
```

## Available Metrics
Idempotency
- `idempotency_keys_pruned_total` - Keys removed by prune job
- `idempotency_duplicate_prevented_total` - Duplicate requests blocked
- `idempotency_replayed_total` - Stored responses reused
- `idempotency_lookup_time_ms` - Lookup latency histogram

Pruning Job
- `idempotency_prune_job_errors_total` - Prune failures
- `idempotency_prune_job_non_empty_total` - Jobs that pruned >0 keys
- `idempotency_ttl_hours` - Configured TTL (gauge)

QBO Sync metrics
- `qbo_sync_enqueued_total` - Number of POs enqueued to Redis (label with `{ org_id }`)
- `qbo_sync_failures_total` - Number of sync errors (label with `{ org_id, reason }`)
- `qbo_sync_refreshes_total` - Number of token refreshes performed (label with `{ org_id }`)

## Prometheus Integration
Deploy ServiceMonitor:
```bash
kubectl apply -f k8s/service-monitor.yaml
```
Verify metrics are scraped:
```bash
curl http://<bridgeflow-service>:<port>/metrics | grep idempotency
```
Create Grafana dashboard using metrics.

## Health Endpoint
The exporter exposes `/metrics/health` which returns a simple JSON health object for monitoring:
```json
{ "status": "healthy", "ts": "...", "metrics": { "counters": 4, "gauges": 1, "histos": 1 } }
```

## Notes
- The exporter converts metric names by replacing dots with underscores and appending `_total` for counters. Example: `idempotency.keys_pruned` -> `idempotency_keys_pruned_total`.
- Histograms are exposed as `_count` and `_sum` pairs (simplified) for Prometheus compatibility.
