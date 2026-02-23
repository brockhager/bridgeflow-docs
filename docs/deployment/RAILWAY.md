# Railway Deployment Runbook

**Purpose:** Step-by-step guidance for deploying BridgeFlow to Railway (build, deploy, verify).

## Prerequisites
- Railway account with repository access
- PostgreSQL service added (Railway-managed) to provide `DATABASE_URL`
- (Optional) Redis service for rate-limiting and workers

## Key Files
- `railway.json` — Railway build & deploy configuration
- `Procfile` — process definition (`web: node api/server.js`)
- `.env.example` — environment vars guidance (JWT_SECRET, START_SERVER, VAULT vars)

## Railway Configuration
- Build (Nixpacks): `pnpm install && pnpm prisma generate && pnpm build`
- Start command: `node api/server.js`
- Healthcheck: `/health`

## Deployment Steps
1. Connect repository → Select `bridgeflow` repo
2. Add services: PostgreSQL (required), Redis (optional)
3. In Railway project settings, ensure the `railway.json` is recognized (or set Procfile)
4. Add environment variables in Railway project settings:
   - `DATABASE_URL` (from attached PostgreSQL)
   - `JWT_SECRET` (generate a strong value)
   - `START_SERVER=true` (optional)
   - `NODE_ENV=production`
   - Optional Vault vars: `SECRET_BACKEND=vault`, `VAULT_ADDR`, `VAULT_TOKEN`
5. Deploy and monitor build logs for `pnpm prisma generate` and `pnpm build`
6. Verify healthcheck URL and that API serves `/` (SPA)

## Verification
- `pnpm prisma generate` — should complete successfully during build
- `pnpm build` — front-end builds and produces `web/dist/main.js`
- Server listens on configured port and responds to `/health`
- Static assets served at `/` and SPA routing works (fallback to `index.html`)

## Troubleshooting
- Build failures during `prisma generate`: ensure `DATABASE_URL` is available in Railway build or use `--schema` flags as needed
- Server fails to start: check `NODE_ENV` and `START_SERVER` config, verify `JWT_SECRET` is set
- Static assets not served: confirm `web/dist` contains `index.html` and `main.js` in commit

---

*This runbook is part of Phase 41 — Railway Deployment Configuration.*