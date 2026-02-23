# Phase 1A → 1B Evolution Plan: Resources & Technical Debt

Purpose: Capture the new "Resource" pattern (CTO directive) and define a pragmatic evolution from Phase 1A pilot (manual operator-managed connectors) to Phase 1B (self-service, governed resources). This document answers: Do we need a Resource table now? If so, what minimal fields? How do we evolve to Phase 1B without major refactors?

Short answer
- **Phase 1A:** Yes — add a **minimal Resource record** now to store operator-managed webhook endpoints (and references to email sender or S3 bucket), plus a pointer to secret(s). This avoids hard-coding connectors and makes later evolution straightforward.
- **Phase 1B:** Expand Resource model to support resource types, full configuration, validations, RBAC, per-tenant resources and a self-service UI.

---

WHY Resources matter
- Resources are the canonical abstraction for any external connector or managed secret that a Bridge (workflow) may use.
- They centralize configuration, validation, authentication, and governance (who owns it, who can use it), which prevents ad-hoc glue and operator-only configuration becoming technical debt.
- Introducing a minimal Resource now keeps Phase 1A simple but establishes where connector metadata will live later.

---

PHASE 1A: Minimal Resource (what to implement now)
Goal: Minimal schema and behavior to support operator-managed webhooks and shared email sender / storage configs.

Suggested minimal Resource record (Phase 1A):
- `id` (UUID)
- `tenant_id` (nullable) — for resources tied to a tenant; null for global/operator resources
- `type` (enum) — e.g., `webhook_endpoint`, `s3_bucket`, `email_sender`
- `name` — human-friendly name (e.g., "Acme Webhook (Pilot)")
- `config` (JSONB) — non-sensitive config (e.g., endpoint URL, region, bucket name)
- `secret_id` (nullable) — reference to secret entry in `lib-secrets` (for HMAC secret, API key)
- `validated` (bool) — whether operator validated (test send) the resource
- `created_by` (operator id)
- `created_at`, `updated_at`

Behavior & constraints for Phase 1A:
- Only operators can create/modify Resources (no tenant/UI self-service)
- Resources are used by DeliveryJob Orchestrator when routing DeliveryTasks
- WebhookConfig (earlier concept) can be implemented as a `Resource` with type `webhook_endpoint` — deprecate `WebhookConfig` in favor of `Resource` gradually
- Secrets referenced by `secret_id` are stored in Secrets Manager and audited on access
- Validation: an operator must run a test send before marking a webhook Resource `validated=true`

Why add this in Phase 1A?
- Avoids hard-coding endpoints in code or in scattered DB columns
- Simplifies orchestrator routing logic: all connector metadata comes from Resource lookups
- Makes it easier to evolve to per-tenant resources and self-service in Phase 1B

---

PHASE 1B: Full Resource Model & Management
Goal: Make Resources first-class, user-manageable, and governed entities.

Enhancements to Resource model:
- Add `visibility` (tenant/private | tenant/shared | global) and `ownership` models
- Add `schema` and `uiHints` for resource-specific configuration UI (so UI can render forms dynamically)
- Add `policy` metadata: allowed workflows, quotas, tagging for cost allocation
- Resource versions: support immutable configs with versioning and rollout (version_id)
- Resource lifecycle: `provisioned`, `validated`, `active`, `decommissioned`

Platform features to add in Phase 1B:
- Resource CRUD UI for operators and optionally tenant admins (based on RBAC)
- Self-service onboarding flows and validation wizards for common resources (e.g., webhook test, S3 write test)
- RBAC and approval workflows: tenants request resources, operators approve, etc.
- Billing & quota hooks: attach usage metrics to resources for billing and cost tracking
- Auditable changes + approval workflow for high-risk resources (e.g., customer-provided webhook endpoints)

Security & governance additions in Phase 1B:
- Per-resource secrets stored in SecretsManager with per-resource KMS policies if needed
- Support for tenant-provided secrets and optional customer-managed keys (Phase 2)
- Policy-as-code checks on resource creation (e.g., disallow public S3 buckets, require TLS endpoints)

---

Transition path (Phase 1A -> Phase 1B)
1. Phase 1A: Implement minimal Resource records and use them for operator-managed webhooks and shared email sender
2. Update Orchestrator/Routing: make resource lookup the canonical source for connector details (instead of scattered `WebhookConfig` tables)
3. Add Resource read APIs that DeliveryJob uses to select connectors
4. Phase 1B: introduce Resource UI, validation automation, visibility/ownership, and self-service creation
5. Migrate existing operator-created `WebhookConfig` entries into `Resource` records (migration job that creates Resource rows and updates references)
6. Add policies and RBAC around which tenants or operators can create/edit Resources

---

How Bridges will use Resources
- During job routing: DeliveryJob will refer to `preferred_delivery_method` and then request an appropriate Resource of that type (e.g., `webhook_endpoint`) for the tenant; if none exists and tenant requested webhook, fallback to email and notify the tenant
- For email: resource `email_sender` supplies From address and provider config
- For storage: resource `s3_bucket` supplies bucket name and optionally a signer role to upload PDFs

---

Operational considerations
- Secrets: Resource secrets should never be stored in plain text in DB — always reference `secret_id` and retrieve via `lib-secrets` with auditing
- Validation: test-sends should be automated where possible to mark resources validated
- Auditing: all Resource creation and use events recorded in `audit-service` with who/when/what
- Owner tagging: track who requested/approved resources for compliance

---

Technical debt & risk (acceptances for Phase 1A)
- Phase 1A accepts manual operator configuration and limited automation to speed time to pilot
- Tech debt: no self-service, no resource versioning, and simple validation hooks — these will be explicitly addressed in Phase 1B
- Mitigation: make the Resource API and DB schema stable and generic so Phase 1B additions are additive and low-risk

---

Next Steps
1. Add `Resource` table migration in Phase 1A (minimal schema above) and migrate current `WebhookConfig` entries into it.
2. Update orchestrator code to reference Resources when selecting connectors.
3. Add a small operator-only UI page to create and validate Resources.
4. Plan Phase 1B work to add self-service, policies, and governance workflows.

Questions for CTO / Ops
- Any constraints on operator vs tenant ownership rules for pilot resources?
- Any preferred naming convention or tagging requirements (e.g., `env:pilot`, `project:invoice-delivery`)?


---

Document reference: see `docs/design/phase1a-architecture.md` for Layer 4 integration points and `docs/design/phase1a-autoconfig.md` for fallback behaviors.
