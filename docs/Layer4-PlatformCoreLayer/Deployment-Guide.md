# Deployment & Rollout Guide — Layer 4

Environment flags and commands to enable Layer 4 features in dev or staging.

Flags
- REQUIRE_AUTH=true — enforce JWT auth for API
- ENFORCE_RBAC=true — requirePermission checks return 403 on violations
- LOCKDOWN_JOBS=true — require auth for job endpoints
- SUPER_ADMINS=cto@bridgeflow.test,admin@bridgeflow.test — list of super-admin emails that bypass org checks

Start secure dev server
- Windows (PowerShell): `.
  ./scripts/start-secure-dev.ps1` (recommended)
- Cross-platform:
  `cross-env LOCKDOWN_JOBS=true REQUIRE_AUTH=true ENFORCE_RBAC=true pnpm run api:start`

Monitoring & Alerting (deploy notes)
- The monitoring feature added `AlertRule` and `AlertEvent` to the Prisma schema. **Migrations must be applied before enabling alerting in production.**
  - Dev: `pnpm prisma migrate dev --name add-alerts --schema=prisma/schema.prisma`
  - Staging/Prod: `pnpm db:migrate` (this runs `prisma migrate deploy` via package scripts)
  - Confirm: `pnpm prisma generate` was run (post-migrate). Check that `AlertRule` and `AlertEvent` tables exist.
- Environment variables for delivery:
  - `SMTP_URL` — optional SMTP connection string (examples: `smtp://user:pass@smtp.example.com`). If not set, the app falls back to a JSON transport for development.
  - `EMAIL_FROM` — default from address for email notifications (e.g., `no-reply@example.com`).
- Secret management (deploy notes)
  - The system includes a pluggable secret-backend abstraction. Configure the backend via `SECRET_BACKEND` environment variable:
    - `mock` (default, development)
    - `aws` (AWS Secrets Manager)
    - `vault` (HashiCorp Vault)
  - AWS/Vault require additional env vars:
    - AWS: `AWS_REGION` (required), optional `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `AWS_SESSION_TOKEN` (or rely on IAM role). Optional `AWS_SECRETS_ENDPOINT` for VPC endpoints/localstack.
    - Vault: `VAULT_ADDR` (required), `VAULT_TOKEN` (token auth), or `VAULT_ROLE_ID` + `VAULT_SECRET_ID` for AppRole; optional `VAULT_NAMESPACE`, `VAULT_KV_MOUNT` (default `secret`), `VAULT_KV_VERSION` (default `2`), `VAULT_AUTH_METHOD` (`token|approle`).
  - Behavior: AWS backend retries on throttling, records audit entries for AWS calls (`secret.aws.call`), and will fall back to `mock` if `AWS_REGION` is not set (useful for local dev). Vault backend retries on 429/5xx, records audit entries (`secret.vault.call`), supports KV v2 list/read/write, token or AppRole auth, and falls back to `mock` if `VAULT_ADDR` is missing.
  - Health: `checkSecretBackendHealth()` performs a lightweight `ListSecrets` (aws) or `/sys/health` (vault) to validate connectivity; wire this into your health probes when running `SECRET_BACKEND=aws|vault`.
  - Audit logs are emitted on secret read/write operations; ensure audit collectors are configured in staging/prod.
- Operational guidance:
  - The alert evaluator runs in-process in the API server (see `api/handlers/monitor.js`). For HA deployments, run the evaluator in a single leader instance or move evaluation to a separate worker process to avoid duplicate notifications.
  - Restart the API service after migrations and environment variables are applied.
  - Verify by creating a rule with a threshold that immediately triggers (e.g., metric `system.cpu` threshold `0`) and confirm an `AlertEvent` is created and audit entries are written.

Verification scripts
- `node scripts/create-dev-users.mjs` — create admin/super-admin/test users for dev
- `node scripts/verify-job-lockdown.mjs` — run quick checks for endpoints & audit

Recommendations
- Roll out `LOCKDOWN_JOBS` first observed in tests then enable `REQUIRE_AUTH` and `ENFORCE_RBAC`.
- For large tenant bases, consider server-side CSV export or streaming to avoid browser memory pressure.
- For production, consider moving the evaluator out-of-process or leader-election to ensure single evaluation loops across multiple replicas.
