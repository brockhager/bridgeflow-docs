# Phase 1A Architecture — 5-Layer Model with Dual Delivery

Purpose: Define the minimal, practical architecture for the Phase 1A Invoice Delivery vertical slice. The system supports two business-language delivery options in the wizard:

- "Send as a secure email" (Default)
- "Connect directly to my system" (API / JSON Webhook — configured by our team)

This spec uses a 5-Layer model and includes minimal data models, retry rules, security notes, and Mermaid sequence diagrams for each happy path.

---

## Summary & Intent
- Phase 1A is focused on delivering “magic” for pilots (5–10 customers) — minimal operational overhead, small infra footprint, and fast time to value.
- We support two delivery methods: Email (default) and Webhook (manual setup by ops). The wizard exposes both as simple business choices; only operators configure webhooks behind the scenes.
- Keep complexity low: no tenant self-service webhook configuration in Phase 1A, simple API key/HMAC auth for webhook deliveries, encrypted PDF attachments for email.

---

## Layer 1 — Abstraction (UX / Workflow)
Purpose: Provide a simple, business-language workflow for users and minimal, operator-facing controls to configure webhooks.

Phase 1A capabilities:
- Wizard exposes two choices in Screen 4 (see `phase1a-wizard.md`):
  - **Send as a secure email** (default)
  - **Connect directly to my system** ("We’ll set this up for you — chat with an operator")
- If user chooses webhook option, the wizard records `preferred_delivery_method = webhook`, but does not ask for endpoint or credentials.
- Operator workflow (internal): Admin creates `WebhookConfig` for the tenant (endpoint URL, secret, optional headers).
- UX guarantees: business-language only. User sees "Connect directly to my system — we’ll handle setup" and receives notification when the connector is active.

Notes:
- For pilot speed, webhook setup is a manual operator step (internal portal or CLI) that is fast and controlled.

---

## Layer 2 — Connection Fabric
Purpose: Connectors that actually deliver invoices to external endpoints.

Components:
- Connector A: **SMTP/Email Gateway Connector**
  - Sends emails via a trusted provider (e.g., AWS SES).
  - Accepts: recipient email, subject, PDF attachment S3 link (or inline base64 if small), optional email template data.
  - Retry logic: transient errors retried (1m, 10m, 60m), mark permanent on hard bounces.
  - Timeouts: connect 5s, send 30s (provider limit). Handle provider throttling with exponential backoff.

- Connector B: **HTTPS Webhook Client Connector**
  - Posts JSON v1 payload to operator-configured endpoint.
  - Retries: **up to 3 attempts total**, with retries spaced **5 minutes** apart (attempt 1 = immediate, retry 1 = +5m, retry 2 = +10m). Failure classification: 2xx = success, 3xx/4xx = permanent (no retry unless 429), 5xx/network = transient retry.
  - Timeouts: **30 seconds** per attempt (adjustable if endpoint indicates otherwise).
  - Security: include HMAC signature header using a per-webhook shared secret (HMAC-SHA256 over payload + timestamp) and an `X-Bridgeflow-Signature` header.
  - Idempotency: include `x-bridgeflow-id` header (deliveryTaskId) so receivers can dedupe.

Phase 1A constraints:
- No mTLS; simple HMAC-based auth is sufficient for pilot customers.
- Webhook endpoints are validated by operator before enabling for production jobs (test send required).

---

## Layer 3 — Data Mapping
Purpose: Normalize invoice data and produce two target formats: PDF (for email) and JSON schema (for webhook).

Components & behavior:
- **Auto-mapping service** (already defined in `phase1a-autoconfig.md`) produces normalized `Invoice` objects.
- **Transformer A — PDF Generator**
  - Input: normalized `Invoice` object
  - Output: PDF file (templated layout) uploaded to S3 (server-side encryption enabled).
  - PDF name convention: `invoices/{tenantId}/{jobId}/{invoiceId}.pdf`

- **Transformer B — JSON v1 Schema**
  - Input: normalized `Invoice` object
  - Output: JSON payload conforming to v1 schema (see below)

JSON v1 schema (minimal):
```json
{
  "invoice_id": "string",
  "tenant_id": "string",
  "customer": { "name": "string", "email": "string" },
  "date": "YYYY-MM-DD",
  "due_date": "YYYY-MM-DD",
  "amount": { "currency": "USD", "value": 123.45 },
  "items": [{ "description": "", "qty": 1, "unit_price": 123.45 }],
  "metadata": { }
}
```

Notes:
- Both transformers have the same source `Invoice` objects, so normalized data feeds both flows with a single parsing step.
- Validation occurs pre-transform; invalid invoices are flagged and surfaced to users/operators.

---

## Layer 4 — Platform Core
Purpose: Orchestration, routing, minimal agent management, security, and audit.

Core components:
- **DeliveryJob Orchestrator**
  - Responsible for: reading parsed invoices, scheduling `DeliveryTask`s, selecting route (email vs webhook) based on `preferred_delivery_method` and `WebhookConfig` availability.
  - For each invoice: create `DeliveryTask` record and enqueue to worker queue.

- **Worker(s)**
  - Execute the delivery tasks: call Transformer(s) and then Connector(s).
  - Maintain attempt counters and schedule retries per policy.

- **Agent Management (Phase 1A minimal)**
  - Simple internal `WebhookConfig` service for operator-created endpoint configurations.
  - Service accounts or internal credentials stored in `lib-secrets` and audited on access.

 - **Resources (new abstraction — Phase 1A minimal)**
   - A **Resource** is a configured entity that encapsulates connection details and authentication for external systems (e.g., `webhook_endpoint`, `s3_bucket`, `email_sender`).
   - Phase 1A: implement a minimal `Resource` record to store operator-configured webhook endpoints (type=webhook_endpoint), a pointer to secret (secret_id), a `validated` flag, and owner/tenant association. This is the canonical place to keep operator-managed connectors.
   - The DeliveryJob Orchestrator will select a Resource when routing a `DeliveryTask` to the webhook connector. For email, Resources can store the email sender configuration (phase1A: a shared sender managed by ops).
   - Rationale: introducing the Resource concept early avoids later refactors and provides a single source of truth for connectors and credentials.

- **Security & Audit**
  - Audit events: `JOB_CREATED`, `MAPPING_AUTODETECT`, `DELIVERY_TASK_CREATED`, `DELIVERY_ATTEMPT`, `DELIVERY_SUCCESS`, `DELIVERY_FAILED`, `PORTAL_CREATED`.
  - Access control: tenant-scoped RBAC (tenant owners and operators). Webhook config is operator-only in Phase 1A.

Routing rules (simple):
- If `preferred_delivery_method == webhook` and a validated `WebhookConfig` exists -> route to webhook connector.
- Otherwise -> route to email connector.
- If webhook config absent for webhook preference: default back to email and notify tenant: "We’ll send by email while we set up your webhook." (business language)

---

## Layer 5 — Infrastructure
Purpose: Runtime environments, storage, and operational considerations.

Runtime and hosting:
- Minimal services can run as small Node.js processes behind a single cluster (ECS/Fargate or a single VM for pilots).
- Worker queue: simple Redis/RabbitMQ or small SQS queue (AWS SQS recommended for easy provisioning).

Storage & artifacts:
 - PDFs: S3 (encrypted SSE), short retention policy (default **24 hours** hot storage, then delete). Core invoice data (normalized JSON and audit events) are retained for **7 years** to support regeneration and audits.
- JSON payloads: store a copy with each `DeliveryAttempt` as a small JSON blob in the DB (Postgres JSONB) for quick debugging and audit; optionally archive to S3 if retention needed.
- Audit logs & events: write-only ingest to `audit-service` with 7-year retention for compliance events.

Operational notes:
- Health checks and metrics endpoints for every service (ready/liveness)
- Alerts: jobs error rate, deliverability drop (<95% success), high retry counts, webhook endpoint failure rates

---

## Minimal Data Model (SQL / conceptual)

DeliveryJob
- id (UUID)
- tenant_id
- created_by (user id)
- preferred_delivery_method ENUM('email','webhook')
- source_id (csv_file_id or qb_connection_id)
- status ENUM('pending','active','failed')
- created_at, updated_at

Invoice
- id (UUID)
- job_id
- invoice_number (string)
- customer_name
- customer_email
- date
- due_date
- amount_currency, amount_value
- items JSONB
- normalized JSONB
- status ENUM('valid','invalid','delivered','failed')

DeliveryTask
- id (UUID)
- invoice_id
- delivery_method ENUM('email','webhook')
- webhook_config_id (nullable)
- pdf_s3_key (nullable)
- json_payload JSONB (nullable)
- status ENUM('queued','in_progress','delivered','failed')

DeliveryAttempt
- id
- delivery_task_id
- attempt_number
- status (success/failure)
- error_code
- error_message
- response_code (for webhook)
- response_body (optional)
- payload_snapshot (opt JSON)
- created_at

WebhookConfig
- id
- tenant_id
- endpoint_url
- secret_id (reference to secrets manager)
- validated boolean
- created_at

Resource (Phase 1A minimal)
- id (UUID)
- tenant_id (nullable)
- type (enum: 'webhook_endpoint' | 's3_bucket' | 'email_sender')
- name (string)
- config JSONB (non-sensitive fields, e.g., endpoint URL, bucket name)
- secret_id (nullable) — pointer to `lib-secrets`
- validated (bool)
- created_by
- created_at, updated_at

Note: `WebhookConfig` can be migrated into `Resource` records; `Resource` is the long-term canonical model for connector configuration.

---

## Mermaid Sequence Diagrams (Happy Paths)

Email flow (happy path):

```mermaid
sequenceDiagram
  participant User
  participant UI
  participant Orchestrator
  participant Parser
  participant Transformer
  participant S3
  participant EmailConnector
  participant Recipient

  User->>UI: Click Start (preferred_delivery_method=email)
  UI->>Orchestrator: Create DeliveryJob
  Orchestrator->>Parser: Parse CSV / fetch invoices
  Parser-->>Orchestrator: invoices[] (normalized)
  Orchestrator->>Transformer: generate PDFs
  Transformer->>S3: Upload PDFs (s3://...)
  Transformer-->>Orchestrator: pdf_s3_keys
  Orchestrator->>EmailConnector: send email with PDF link/attachment
  EmailConnector->>Recipient: Deliver email
  Recipient-->>EmailConnector: 250 OK
  EmailConnector-->>Orchestrator: Delivery success
  Orchestrator-->>UI: Job Active; notify user "First invoice sent"
```

Webhook flow (happy path):

```mermaid
sequenceDiagram
  participant User
  participant UI
  participant Orchestrator
  participant Parser
  participant Transformer
  participant WebhookConnector
  participant CustomerSystem

  User->>UI: Click Start (preferred_delivery_method=webhook)
  UI->>Orchestrator: Create DeliveryJob
  Orchestrator->>Parser: Parse CSV / fetch invoices
  Parser-->>Orchestrator: invoices[] (normalized)
  Orchestrator->>Transformer: transform to JSON v1
  Transformer-->>Orchestrator: json_payloads
  Orchestrator->>WebhookConnector: POST payload (signed)
  WebhookConnector->>CustomerSystem: POST /endpoint
  CustomerSystem-->>WebhookConnector: 200 OK
  WebhookConnector-->>Orchestrator: Delivery success
  Orchestrator-->>UI: Job Active; notify user "First invoice sent"
```

In both diagrams, the flows diverge at the Connector stage (EmailConnector vs WebhookConnector).

---

## Retry, Timeout & Failure Policies (recap)
-- Retries:
  - Email: transient errors retried (1m, 10m, 60m) (three attempts total)
  - Webhook: **up to 3 attempts total**, spaced **5 minutes** apart (attempt 1 immediate, retries at +5m and +10m)
-- Timeouts:
  - Email connect 5s, email send 30s
  - Webhook: **30 seconds** per attempt
-- Permanent failure rules: webhook 4xx except 429 = permanent; email 5xx and hard bounces = permanent
- On permanent failure: create portal entry and notify tenant; operator can retry manually

---

## Security & Compliance (Phase 1A minimal)
- Transport: HTTPS / TLS for webhooks and API; email via TLS
- Storage: S3 SSE for PDFs; DB encryption for JSON payloads or store small payloads in JSONB
- Secrets: webhook shared secrets stored in `lib-secrets` (Secrets Manager) and rotated per policy (Phase 1B for automated rotation)
- Audit: all major events are logged to `audit-service`

---

## Decision Points / Questions for CTO
1. **PDF retention**: Confirmed — PDFs retained in hot storage for **24 hours**; core invoice data retained for **7 years** for audit/regeneration.
2. **Webhook retry schedule & timeout**: Confirmed — webhooks retry up to **3 attempts** spaced **5 minutes** apart; **30s** timeout per attempt.
3. **Webhook auth**: Confirmed — HMAC-based signatures (HMAC-SHA256) are acceptable for Phase 1A pilots.
4. Next decisions: confirm whether we should create a minimal `Resource` table in Phase 1A to store operator-managed webhook configs (recommended: yes). 

---

## Next steps
1. Sign-off on decision points above
2. I will scaffold the minimal service structure and a small sequence diagram snippet in Mermaid files for docs
3. Implement monitoring and alert templates for job failure thresholds and retry spikes

