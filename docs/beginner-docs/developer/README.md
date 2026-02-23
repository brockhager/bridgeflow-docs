# Developer Quick Start (bf_employee)

This short guide is for developers working on BridgeFlow. The team refers to the developer role as **bf_employee**. Follow these steps to get productive fast.

1. Follow the parent quick start:
   - `cd bridgeflow` → `pnpm install` → `pnpm run railway:setup`
2. Start services:
   - Backend API: `pnpm run api:start` (port 4000)
   - Frontend dev server: `pnpm run web:dev` (port 3000)
3. Run tests locally:
   - `pnpm test` (full suite) or `pnpm run test:api`
   - Ensure each test file calls `await resetTestDatabase()` (see `test/utils/resetDb.js`).
4. Common dev tasks:
   - `pnpm run prisma:generate` after changing `prisma/schema.prisma`
   - Run workers locally: `pnpm run worker:s3-flush:once`
5. Conventions & gotchas:
   - ESM-only: use `import` / `export`.
   - Do not enable `BRIDGEFLOW_DEV_ADMIN` in CI (it hides auth issues).
   - Tenant isolation uses AsyncLocalStorage + Prisma middleware (`api/lib/tenantContext.js`).

Where to learn more:
- Onboarding & dev orientation: `docs/ONBOARDING.md`
- Architecture: `docs/ARCHITECTURE.md`
- Agent guidance: `.github/copilot-instructions.md`

If you need help, see the parent guide or contact the repo owner listed in `docs/ONBOARDING.md`.
