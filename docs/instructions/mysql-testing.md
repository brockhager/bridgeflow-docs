# MySQL Local Testing Guide (Windows)

This guide explains how to run end-to-end tests using a local MySQL server on Windows and Ethereal for email preview. This is optional and does not affect CI (which uses PostgreSQL).

Prerequisites
- MySQL Installer for Windows (https://dev.mysql.com/downloads/installer/)
- Node.js + pnpm installed
- Project cloned locally

1) Install MySQL (Windows)
- Download MySQL Installer (MSI) from https://dev.mysql.com/downloads/installer/
- Run the installer and choose "Developer Default"
- Set root password when prompted (example: `root`)
- Complete installation and ensure MySQL service is running

2) Create database
- Open MySQL Shell or `mysql` CLI and run:
```sql
CREATE DATABASE bridgeflow DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

3) Create `.env.mysql` (do NOT commit)
```
DATABASE_URL="mysql://root:root@localhost:3306/bridgeflow"
```

4) Prepare Prisma MySQL schema
- The repository includes `prisma/schema.mysql.prisma` that adapts the canonical schema for MySQL. You can generate/update it with:
```powershell
node scripts/prepare-mysql-schema.js
```

5) Apply migrations and generate client
```powershell
$env:DATABASE_URL="mysql://root:root@localhost:3306/bridgeflow"
pnpm exec prisma migrate dev --schema prisma/schema.mysql.prisma --name init_mysql
pnpm exec prisma generate --schema prisma/schema.mysql.prisma
```

6) Run the Ethereal E2E test (no real SMTP creds needed)
```powershell
$env:DATABASE_URL="mysql://root:root@localhost:3306/bridgeflow"
$env:USE_MOCK_DB="false"
$env:USE_ETHEREAL="true"
$env:EMAIL_FROM="bridgeflow-test@example.com"
$env:EMAIL_TO="brockhager@gmail.com"
node scripts/test-email-flow.js
```

7) Rollback / Restore
- To rollback migration:
```powershell
pnpm exec prisma migrate reset --schema prisma/schema.mysql.prisma
```
- To switch back to PostgreSQL, reset `DATABASE_URL` to the PostgreSQL connection and use the canonical `prisma/schema.prisma`.

Notes & Caveats
- `prisma/schema.mysql.prisma` converts `String[]` to `Json` to work around MySQL's lack of native arrays.
- Enums and Json are supported by MySQL connector; however generated SQL may differ from PostgreSQL migrations. Review migration SQL before applying to production.
- CI remains unchanged — it still uses `prisma/schema.prisma` and PostgreSQL. Do not commit or overwrite `prisma/schema.prisma`.

If you want, I can:
- Generate an initial migration SQL file for MySQL and include it in the repo (requires local MySQL to run `migrate dev`).
- Help troubleshoot Docker/Postgres on Windows instead.
