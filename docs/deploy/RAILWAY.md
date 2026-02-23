Railway Postgres Setup (short) ✅

Prereqs:
- Railway project with a Postgres service running
- You have access to Railway Dashboard

1) Get DATABASE_URL
- Railway Dashboard → your project → Postgres service → Variables
- Copy DATABASE_URL value (e.g., postgresql://postgres:password@host:5432/railway)

2) Add to App Service variables
- App Service → Variables → New Variable
- Name: DATABASE_URL
- Value: ${{Postgres.DATABASE_URL}} (Railway auto-reference)
- Click Deploy (Railway re-deploys automatically)

3) Run migrations (local terminal or CI)
- pnpm dlx prisma db push --force-reset
- pnpm dlx prisma generate
- pnpm dlx prisma db seed (if you have a seed script)

4) Quick setup script (provided in repo)
- Use the helper to run push/generate/seed and optionally check /api/health:
  DATABASE_URL="<railway url>" APP_URL="https://your-app.railway.app" pnpm run railway:setup

5) Verify
- curl https://your-app.railway.app/api/health  # expect 200 + status
- curl https://your-app.railway.app/api/trading-partners  # should list partners

Notes & safety
- `--force-reset` will reset DB schema; avoid on production unless intended.
- If you prefer migrations instead of `db push`, use `pnpm dlx prisma migrate deploy` and ensure migrations are applied.
- For secrets, use Railway's environment variables and do not commit credentials.

CI / Deploy
- Recommended: Add a post-deploy step in Railway or GitHub Actions to run `pnpm dlx prisma migrate deploy` or `pnpm run railway:setup` in a controlled way.

If you want, I can add a GitHub Actions workflow that runs `pnpm dlx prisma migrate deploy` and `pnpm dlx prisma db seed` against Railway after successful deploys. Ping me and I’ll add a ready-to-use workflow file.
