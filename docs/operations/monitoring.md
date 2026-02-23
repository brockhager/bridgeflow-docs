# Monitoring & Metrics — Operations Guide

Purpose: a concrete monitoring plan and dashboard spec for Phase 37 Week 2 (follow-up to structured logging). Use this as the source of truth for dashboard panels, PromQL examples, and alert rules.

## Core Dashboards
1. System Health (per service)
   - Panels:
     - CPU usage (avg, 1m, 5m) — PromQL: `avg(rate(process_cpu_seconds_total[1m])) by (instance)`
     - Memory usage — `process_resident_memory_bytes`
     - Disk usage — node exporter metrics
     - Uptime / restarts

2. Job & Worker Health
   - Panels:
     - Job queue depth (redis list length) — `redis_list_length{queue="onboarding_jobs"}`
     - Job processing rate: `rate(onboarding_jobs_processed_total[1m])`
     - Job failure rate: `rate(onboarding_jobs_failed_total[5m])`
     - Long-running jobs: `histogram_quantile(0.95, sum(rate(onboarding_job_duration_seconds_bucket[5m])) by (le))`

3. API & Error Metrics
   - Panels:
     - API latency (p95/p99): `histogram_quantile(0.95, sum(rate(http_request_duration_seconds_bucket[5m])) by (le, handler))`
     - 5xx error rate per endpoint: `sum(rate(http_requests_total{status=~"5.."}[5m])) by (handler)`
     - Request rate per endpoint

4. Business Metrics (Onboarding)
   - Panels:
     - Onboarding completion rate (per template): `sum(onboarding_completed_total) by (template) / sum(onboarding_started_total) by (template)`
     - Average setup time per template: `histogram_quantile(0.5, sum(rate(onboarding_duration_seconds_bucket[1d])) by (le, template))`
     - Provisioning failure reasons: Top error codes/messages (requires instrumented logging and labels)

## Alerting Rules (examples)
- High failure rate (critical):
  - `rate(onboarding_jobs_failed_total[10m]) / rate(onboarding_jobs_processed_total[10m]) > 0.05`
  - Severity: `critical`
  - Escalation: on-call -> manager -> CTO
- Long-running jobs (warning -> critical):
  - `max_over_time(onboarding_job_duration_seconds[15m]) > 600` (warning)
  - `max_over_time(onboarding_job_duration_seconds[30m]) > 900` (critical)
- Job backlog growing (warning):
  - `increase(redis_list_length{queue="onboarding_jobs"}[5m]) > 10`

## Customer-Specific Views
- Enable per-organization dashboards (tagged by `orgId`) for enterprise customers
- Provide read-only links with RBAC: dashboards only accessible if requestor has `monitor:*` for the org

## Data Retention & Storage
- Default retention: 30 days (Prometheus)
- Enterprise retention option: 90 days
- Long-term trend aggregation: rollup hourly/daily metrics into Postgres/TimescaleDB for 1-year retention

## Implementation Notes
- Instrument code to increment counters and record durations (use OpenMetrics conventions)
- Extract metrics from structured logs where direct instrumenting is impractical (e.g., third-party lib timing)
- Correlate metrics with `traceId` and `sessionId` for drill-down in dashboards
- Provide direct links from Grafana panels to `GET /api/logs/trace/:traceId` and `GET /api/logs/session/:sessionId`

## Runbook Snippets
- Triage provisioning failures:
  1. Check job queue depth and failure rate panel
  2. Get recent failed job `traceId` from error panel
  3. `GET /api/logs/trace/:traceId` to view spans and errors
  4. If a retriable error, use the admin UI to `Retry provisioning` and monitor metrics

## Next: Implementation Tasks (Week 2)
- Create Grafana dashboard JSON and import to Grafana workspace
- Add Prometheus exporters/metrics in the API and worker code
- Implement alert rules and subscribe on-call rotation to critical alerts
- Add dashboard links to Admin UI job views and onboarding status pages

---

If you'd like, I can generate example Grafana JSON panels and a list of exact PromQL queries for each panel so the SRE team can import them directly.