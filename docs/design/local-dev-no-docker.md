# Local Development Without Docker

Goals
- Developers should be able to run services locally without requiring Docker.
- Local setup should be simple and documented for Windows (and cross-platform).

Recommended approaches

1) Managed dev DB (recommended)
- Provision a shared dev database (e.g., Supabase) that developers can connect to via credentials.
- Provide a `dev` database user with limited permissions and a dedicated `dev` schema per developer.
- Advantages: no Docker required; consistent environment across developers.

2) Local Postgres installation
- On Windows: use the official Postgres installer (https://www.postgresql.org/download/windows/) or WSL + apt install postgresql
- Scripts in `libs/db` to create DBs and run migrations automatically (e.g., `pnpm -w run db:setup`)

3) In-memory DB for unit tests
- Use `pg-mem` for unit tests that need fast Postgres behavior without an external DB.
- Use test containers or separate CI jobs for integration tests against a real Postgres.

Typical developer workflow
- Copy `.env.example` to `.env.development` and set `DATABASE_URL` to your dev DB
- Run `pnpm -w run migrate:dev` to apply migrations
- Start services selectively e.g. `pnpm --filter services/api-gateway dev` or run all services with `pnpm -w run dev`

Optional helpers (developer convenience)
- `scripts/dev-setup.ps1` - Windows PowerShell script that: verifies local Postgres, creates DBs, runs migrations
- We will not require Docker but can provide an optional `docker-compose.dev.yml` for users who prefer containerized local environments.

Note: For reproducible CI tests, use Docker in CI only, not mandated for local dev.
