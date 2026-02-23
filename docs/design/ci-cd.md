# CI/CD & Release Plan (Draft)

Goals
- Fast feedback loop (lint, test, typecheck) on every PR
- Security gates (CodeQL, dependency scanning) enforced before merge
- Clean release pipeline with rollback strategies (canary/blue-green)

## GitHub Actions - Suggested Jobs
- push / PR
  - lint (eslint + formatting check)
  - test (unit + fast integration using pg-mem or dev DB)
  - typecheck
  - code-scan (CodeQL + dependency-check)
  - build (TypeScript build across packages)
- merge to main (after protection)
  - integration tests (full suite against real Postgres in CI)
  - e2e smoke tests
  - publish artifacts (package registry/private npm + image registry if used)
- release
  - deploy to staging
  - run migration dry-run and smoke tests
  - promote to prod using canary/blue-green pattern

## PR Requirements
- PR template includes checklist: tests included, security review, migration impact, operational runbook required? (yes/no)
- Require at least one code owner review for core libraries and security-sensitive changes

## Secrets in CI
- Use GitHub Encrypted Secrets (or Vault integration) — do not commit credentials

## ESM policy and Prisma in CI

- This repository is ESM-only; ensure `package.json` has `"type": "module"` and all in-repo JS files use `import`/`export`.
- The Prisma CLI historically expects CommonJS config files; to avoid needing CJS artifacts in the repo, invoke Prisma CLI with explicit flags (e.g., `--schema ./prisma/schema.prisma`) in CI scripts.

## Packaging and Deployments
- For serverless: build and publish packages as artifacts, deployments use IaC modules to manage release
- For containerized services: build images, push to registry, scan images before deploy
- For VMs or managed services: use deployment scripts and IAM roles with least privilege

## Rollback Strategies
- Database migrations must be reversible where possible; maintain `down` steps and backup before irreversible schema changes
- Deployments should have a health-check based automated rollback threshold (e.g., >1% error rate in 5 minutes triggers rollback)

## Observability in Pipeline
- Publish test coverage and SLO smoke results as part of PR checks
- Keep a deployment log and attach migration evidence to releases for compliance

Next steps
- Implement `ci.yml` and an integration `integration.yml` workflow example
- Add CodeQL and Dependabot configuration files
- Add a `PR_TEMPLATE.md` and `SECURITY_CHECKLIST.md` in `.github/`
