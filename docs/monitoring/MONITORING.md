# BridgeFlow Monitoring Guide

## Overview

BridgeFlow includes basic monitoring capabilities for tracking system health and job metrics.

## Health Endpoints

### GET /health (Detailed Health Check)

Returns comprehensive system status and metrics.

**Example Request:**
```bash
curl http://localhost:4000/health
```

**Example Response:**
```json
{
  "status": "healthy",
  "timestamp": "2025-12-16T18:30:00.000Z",
  "uptime": 3600,
  "version": "1.0.0",
  "environment": "production",
  "database": {
    "status": "healthy",
    "responseTime": "12ms"
  },
  "metrics": {
    "jobs": {
      "total": 150,
      "succeeded": 120,
      "failed": 25,
      "pending": 5,
      "successRate": "82.76%",
      "jobsPerHour": 15
    }
  },
  "recentActivity": [
    {
      "id": "cmj8x5kpu0000wz5hh4boyjkm",
      "state": "FAILED",
      "age": "120s ago"
    }
  ],
  "responseTime": "145ms"
}
```

### GET /.well-known/health (Simple Health Check)

Returns minimal health status for load balancers.

**Example Response:**
```json
{
  "status": "ok"
}
```

### Temporary Bypass for Vault Compliance (Preview/Test Only)

In some preview or infra-validation deployments where Vault is not yet available (for example, Railway preview environments), you can temporarily bypass the Vault credential compliance check by setting the environment variable `SKIP_VAULT_COMPLIANCE=true`.

- **Use only** in preview, test, or infra-validation deployments (e.g., Railway previews before Vault integration).
- **Never enable** in production once Vault is provisioned.
- When set, the server logs a clear warning such as:

```text
⚠️ SKIP_VAULT_COMPLIANCE=true - Continuing startup despite compliance violations (temporary/preview environment).
```

This escape hatch allows the server to start and ensures `/.well-known/health` responds successfully even when Vault-managed secrets are not available. Treat this as a temporary measure and prioritize provisioning Vault and removing the flag as soon as possible.

## Metrics

### Job Metrics

The health endpoint provides the following job metrics:

- **total**: Total number of jobs in the system
- **succeeded**: Number of successfully completed jobs
- **failed**: Number of failed jobs
- **pending**: Number of jobs awaiting processing
- **successRate**: Percentage of successful jobs (succeeded / (succeeded + failed))
- **jobsPerHour**: Number of jobs created in the last hour

### Database Metrics

- **status**: Database connection status (healthy/unhealthy)
- **responseTime**: Database query response time

## Job Event Logging

Job events are logged in JSON format for easy parsing and monitoring.

### Log Events

- `JOB_CREATED`: When a new job is created
- `JOB_STARTED`: When worker begins processing a job
- `JOB_SUCCEEDED`: When a job completes successfully
- `JOB_FAILED`: When a job fails after max retries
- `JOB_RETRYING`: When a job is scheduled for retry
- `TASK_COMPLETED`: When an individual task completes
- `TASK_FAILED`: When an individual task fails

### Log Format

```json
{
  "timestamp": "2025-12-16T18:30:00.000Z",
  "level": "INFO",
  "message": "Job completed successfully",
  "jobId": "cmj8x5kpu0000wz5hh4boyjkm",
  "event": "JOB_SUCCEEDED",
  "successCount": 5,
  "total": 5,
  "invoiceId": "inv_123"
}
```

### Log Levels

- **ERROR**: Job failures, task failures, system errors
- **WARN**: Job retries, degraded performance
- **INFO**: Job creation, job completion, task completion
- **DEBUG**: Detailed debugging information

## Monitoring Best Practices

### 1. Health Check Polling

Set up automated health checks every 30-60 seconds:

```bash
# Cron job example (every minute)
* * * * * curl -f http://localhost:4000/.well-known/health || alert-team
```

### 2. Log Aggregation

Use a log aggregation tool (e.g., ELK Stack, Splunk, Datadog) to:
- Parse JSON logs
- Create dashboards for job success rates
- Set up alerts for error patterns
- Track job processing times

### 3. Metrics Dashboards

Key metrics to track:
- Success rate over time
- Jobs per hour
- Average job processing time
- Failed job count
- Pending job backlog

### 4. Alerting Rules

Recommended alerts:
- Health endpoint returns 503 (unhealthy)
- Success rate drops below 80%
- Pending jobs exceed threshold (e.g., > 100)
- Database response time > 500ms
- No jobs processed in last hour (if expected)

## Troubleshooting

### Database Connectivity Issues

If health endpoint shows `database.status: "unhealthy"`:
1. Check DATABASE_URL environment variable
2. Verify database is running
3. Check network connectivity
4. Review database logs

### High Failure Rate

If `metrics.jobs.successRate` is low:
1. Check recent error logs for patterns
2. Review failed job details in history page
3. Verify email sender configuration
4. Check for network/SMTP issues

### Growing Pending Queue

If `metrics.jobs.pending` is increasing:
1. Check if worker is running (dev mode: NODE_ENV=development)
2. Verify worker processing jobs (check logs)
3. Consider scaling worker capacity
4. Review job backoff/retry configuration

## Metrics persistence & aggregator

The system now persists aggregate metrics for historical queries. A background worker parses structured logs (from `AuditLog`) and writes hourly aggregates to the `MetricAggregate` table (schema updated in `prisma/schema.prisma`).

Run the aggregator once:

```bash
pnpm run worker:metrics-aggregator
```

Migration & smoke-test checklist

1. Apply the migration and generate Prisma client (local/dev):

```bash
# apply new migration and generate client
pnpm run migrate:metrics
pnpm run prisma:generate
```

2. Backfill once using the aggregator to populate hourly aggregates:

```bash
pnpm run worker:metrics-aggregator
```

3. Smoke tests (basic verification):
- Check `MetricAggregate` table exists and contains rows: `SELECT count(*) FROM "MetricAggregate";`
- Verify `GET /api/metrics/summary?group=jobs` returns non-empty totals after backfill
- Confirm `/admin/metrics` dashboard loads and displays charts
- Run unit/integration tests: `pnpm test` and ensure monitoring tests pass

Rollback plan

If you must rollback the migration in an emergency, you can drop the metric tables (manual SQL rollback):

```sql
DROP TABLE IF EXISTS "MetricAggregate" CASCADE;
DROP TABLE IF EXISTS "MetricCursor" CASCADE;
```

After rollback, re-run `pnpm run prisma:generate` to sync the Prisma client.

Endpoints to query persisted metrics:
- `GET /api/metrics/timeseries?metricKey=<prefix or key>&orgId=<org>&from=<ISO>&to=<ISO>` — returns time series grouped by `metricKey`
- `GET /api/metrics/summary?group=jobs|api|onboarding|errors&orgId=<org>&from=<ISO>&to=<ISO>` — returns aggregated summary (e.g., job success rate)

This enables enterprise dashboards and historical trend analysis without external dependencies.

## Future Enhancements

Planned monitoring improvements:
- Prometheus metrics endpoint
- Grafana dashboard templates
- Custom metric exports
- Performance profiling
- Distributed tracing
- Real-time metrics streaming

## Related Documentation

- [Railway Setup](RAILWAY-SETUP.md) - Database configuration
- [Testing Guide](instructions/TESTING.md) - Testing procedures
- [Task Board](task-list-2.md) - Project progress tracking
