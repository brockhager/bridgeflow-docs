# Idempotency: Production Deployment

## Kubernetes CronJob

Deploy the pruning job with:

```bash
kubectl apply -f k8s/prune-idempotency-cronjob.yaml
```

Verify the CronJob and inspect logs:

```bash
kubectl get cronjobs -n bridgeflow-production
kubectl get jobs -n bridgeflow-production --selector=job-name=prune-idempotency-keys- -o wide
kubectl logs -l job-name=<prune-job-name> -n bridgeflow-production
```

## Enabling Metrics Scraping (Staging)

We provide a kustomize overlay for staging which enables the metrics exporter and exposes the metrics port via the Service.

```bash
# Apply the staging overlay (from repo root)
kubectl apply -k k8s/overlays/staging -n staging
```

Or use the convenience script:

```bash
./scripts/deploy-metrics.sh
```

This will:
- Apply the `ServiceMonitor` (so Prometheus will scrape `/metrics`)
- Patch the `bridgeflow-api` Deployment in `staging` to set `EXPOSE_METRICS=true` and `METRICS_PORT=3000`
- Port-forward to verify `/metrics` locally

## Production overlay
A production overlay is available at `k8s/overlays/production` and includes:
- Production security hardening (non-root, read-only filesystem, dropped capabilities)
- ServiceAccount with IAM annotation (EKS example)
- Secrets patch (use `scripts/deploy-production.sh` to supply and validate secrets)
- ConfigMap generator for runtime config (NODE_ENV, LOG_LEVEL, EXPOSE_METRICS)

Deploy production with:

```bash
export DB_URL="postgresql://user:pass@prod-rds:5432/bridgeflow"
export REDIS_URL="redis://prod-redis:6379"
export JWT_SECRET="<secure-secret>"
./scripts/deploy-production.sh bridgeflow-production
```

### Environment
- `DATABASE_URL` is read from `bridgeflow-secrets.database-url` (Kubernetes Secret)
- `IDEMPOTENCY_TTL_HOURS` defaults to `24` if unset

## Prometheus Alerting
Apply rule:

```bash
kubectl apply -f k8s/prune-idempotency-alerts.yaml
```

Alert rules included:
- `IdempotencyPruneJobFailed`: fires when `idempotency_prune_job_errors` increases by >=3 in 24h
- `ExcessiveIdempotencyKeys`: fires when `idempotency_keys_total > 10000`

## Database Indexes (recommended)
Run during maintenance window and use CONCURRENTLY when supported:

```sql
CREATE INDEX CONCURRENTLY idx_idempotency_created_at 
ON idempotency_keys (created_at);

CREATE INDEX CONCURRENTLY idx_idempotency_tenant_created 
ON idempotency_keys (tenant_id, created_at);
```

## Monitoring & Alerts
- Warning: >10,000 unpruned idempotency keys
- Critical: prune job fails 3 consecutive times
- Metrics to track: `idempotency.keys_pruned`, `idempotency.prune_job.errors`, `idempotency.ttl_hours`, `idempotency.lookup_time_ms`

## Notes
- The prune job is lightweight and intended to run once daily at 03:00 UTC; adjust schedule if needed.
- Ensure your monitoring system (Prometheus) is scraping the metrics exporter that exposes the idempotency counters/gauges.
