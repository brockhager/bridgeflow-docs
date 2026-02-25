# CONTROL TOWER

`bf-control` is the incident/case orchestration layer for resilience operations.

## Case Management

- List, filter, and paginate control cases by tenant.
- Retrieve individual case detail.
- Update case status, assignee, and resolution notes.
- Dedicated assign and resolve actions with validation.

## Event Ingestion

- `POST /api/control/events` pipeline for control event ingestion.
- Optional rule evaluation during ingest.
- Standardized ingest response for downstream processing.

## Public Resilience Status

- Public resilience endpoint for external visibility.
- Built-in request rate limiting.
- Structured error responses and retry hints.
- Privacy-preserving access logging (hashed client keys).

## Background Operations

- Escalation watcher loop for overdue/escalating cases.
- Weather ingest loop support for external risk signals.
- Startup/shutdown task lifecycle management.
