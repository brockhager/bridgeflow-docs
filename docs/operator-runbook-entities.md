# Operator Runbook — Entities & Resources (Phase 1A)

Purpose: Quick operational steps for pilot operators to create, validate, and manage Resource Entities used by the Invoice Delivery flow.

Prerequisites
- Access to the production database or a secure operator tool that can create `Entity` and `Resource` records
- Knowledge of the tenant for which the resource applies (tenant_id optional for Phase 1A)
- Access to `lib-secrets` or the secret manager to store sensitive keys/secrets

Important: In Phase 1A, Resource creation is operator-only. Do not expose these steps to tenants until Phase 1B is implemented.

---

1) Create a Resource Entity (via SQL)

Example: Create a webhook endpoint resource

```sql
INSERT INTO "Entity" ("name", "type", "tags") VALUES ('Acme Webhook (Pilot)', 'resource', ARRAY['env:pilot','type:webhook']) RETURNING id;
-- take the returned id (ENTITY_ID)

INSERT INTO "Resource" ("entityId", "resourceType", "config", "status")
VALUES ('ENTITY_ID', 'webhook', '{"endpoint":"https://acme.example/webhook","auth":"hmac"}', 'validating');
```

Note: Keep secrets out of `config` (do not store shared secret values directly in DB). Instead, store in the secret manager and reference via `secret_id` once your secrets manager tooling is in place.

2) Validate the Resource (test send)

- Use the internal operator UI or run a test-send command (CLI) to post a test invoice payload to the webhook endpoint.
- Confirm the remote service returns `200` and that the payload is processed.
- If successful, update the Resource status to `active` and record `validatedAt`:

```sql
UPDATE "Resource" SET status = 'active', validatedAt = now() WHERE entityId = 'ENTITY_ID';
```

- If the endpoint fails, inspect lastError and logs. If it's a transient error, retry after making adjustments. If the endpoint rejects the signature, confirm secrets and HMAC signing configuration.

3) Deactivate or Swap Resource

- To deactivate:
```sql
UPDATE "Resource" SET status = 'inactive', lastError = 'Manually deactivated by operator' WHERE entityId = 'ENTITY_ID';
```

- To swap Resource for an active job or tenant:
  - Create the new Resource (follow step 1)
  - Validate it (step 2)
  - Update the DeliveryJob/tenant configuration to point to the new Resource (or update operator configuration to prefer the new one)

4) Audit & Logging

- All operator actions should be recorded in `audit-service` with the operator id and timestamp (JOB_CREATED, RESOURCE_CREATED, RESOURCE_VALIDATED, RESOURCE_DEACTIVATED).
- Keep records of validation attempts and results for compliance evidence.

5) Troubleshooting

- If test sends fail with a 4xx code, inspect the response body for authentication or payload errors; confirm HMAC secret and timestamp windows.
- If test sends time out, check network accessibility and DNS for the endpoint; ensure firewall rules allow outbound traffic from our worker hosts.
- If the remote system is flaky, consider setting Resource status to `validating` until stable.

---

Notes for future automation
- In Phase 1B, automate validation with a standard test payload and add a short-lived validation token that the remote system can echo back.
- Add an operator UI that stores secrets securely in `lib-secrets` and references them via `secret_id` on the Resource record.

---

Contact
- If you need assistance, contact the on-call platform engineer or the CTO.
