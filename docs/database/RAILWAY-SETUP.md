# Railway PostgreSQL Setup - Complete ✅

## Summary

BridgeFlow is now configured to use Railway PostgreSQL as the production/staging database. All migrations have been applied and the system is operational.

## Connection Details

**Database**: Railway PostgreSQL
**Host**: `gondola.proxy.rlwy.net:42013`
**Database Name**: `railway`
**Connection String**: Stored in `.env` and GitHub Secrets as `STAGING_DATABASE_URL`

## What Was Configured

### 1. Environment Variables

**Local Development** (`.env`):
```env
DATABASE_URL="postgresql://postgres:***@gondola.proxy.rlwy.net:42013/railway"
NODE_ENV="staging"
```

**CI/CD** (GitHub Secrets):
- `STAGING_DATABASE_URL`: Railway connection string (already configured)

### 2. Database Schema

All Prisma migrations have been applied to Railway:
- ✅ 3 migrations applied successfully
- ✅ Database schema is up to date
- ✅ Tables created: Entity, Resource, DeliveryJob, DeliveryTask, Invoice, AuditLog

### 3. Current Database State

As of 2025-12-16:
- **Entities**: 100 (from CI seed runs)
- **Resources**: 100 (from CI seed runs)
- **Delivery Jobs**: 31+ (test jobs)
- **Audit Logs**: 225+
- **Invoices**: Generating on successful jobs

### 4. Verification Steps Completed

✅ **Connection Test**: Successfully connected to Railway DB
✅ **Migration Status**: All migrations applied, schema up to date
✅ **Data Persistence**: Jobs created via API persist in Railway
✅ **Worker Processing**: Dev worker processes jobs from Railway DB
✅ **Foreign Keys**: Constraints working correctly
✅ **API Endpoints**: All endpoints work with Railway DB

### 5. Test Results

**Unit Tests** (Mock DB): 6/6 passing ✅
**API Test**: Job creation successful ✅
**Worker Test**: Jobs processed correctly ✅
**Data Persistence**: Verified in Railway dashboard ✅

## Usage

### Starting the Server

**Development Mode** (with dev worker):
```bash
# PowerShell
$env:NODE_ENV="development"
node api/server.js

# Bash
NODE_ENV=development node api/server.js
```

**Production Mode**:
```bash
# PowerShell
$env:NODE_ENV="production"
node api/server.js

# Bash
NODE_ENV=production node api/server.js
```

### Running Migrations

**Deploy migrations to Railway**:
```bash
pnpm exec prisma migrate deploy --schema prisma/schema.prisma
```

**Check migration status**:
```bash
pnpm exec prisma migrate status --schema prisma/schema.prisma
```

**Create new migration** (dev only):
```bash
pnpm exec prisma migrate dev --name description_here --schema prisma/schema.prisma
```

### Database Management

**View data with Prisma Studio**:
```bash
pnpm exec prisma studio --schema prisma/schema.prisma
```

**Check database state**:
```bash
node scripts/cleanup-railway-db.js
```

**Clean up old test data**:
```bash
pnpm exec cross-env CLEANUP=true node scripts/cleanup-railway-db.js
```

## CI/CD Integration

The CI/CD pipeline is configured to use Railway PostgreSQL:

1. **Workflow**: `.github/workflows/migrate.yml`
2. **Secret**: `STAGING_DATABASE_URL` (Railway connection string)
3. **Steps**:
   - Generate Prisma client
   - Apply migrations
   - Seed database
   - Verify schema

**All CI jobs now run against Railway instead of local Postgres service.**

## Mock DB vs Railway DB

### Mock DB (Development/Testing)
```bash
# Use in-memory mock DB
$env:USE_MOCK_DB="true"
node scripts/test-email-flow.js
```

**Use cases**:
- Unit tests (`pnpm test`)
- Local development without DB
- Fast, isolated testing

### Railway DB (Staging/Production)
```bash
# Use Railway PostgreSQL
# (no USE_MOCK_DB flag)
node api/server.js
```

**Use cases**:
- Production workloads
- Data persistence
- Integration testing
- CI/CD pipelines

## Switching Between Databases

### Use Railway (Default)
```bash
# Just run with .env configured
node api/server.js
```

### Use Mock DB
```bash
$env:USE_MOCK_DB="true"
node api/server.js
```

### Use Local Postgres
```bash
# Update .env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/postgres?schema=public"
node api/server.js
```

## Important Notes

1. **Don't commit sensitive data**: The `.env` file contains the Railway password and is gitignored
2. **CI/CD uses Railway**: GitHub Actions runs migrations against Railway DB via secret
3. **Mock DB for tests**: Unit tests still use Mock DB for speed and isolation
4. **Foreign keys enforced**: Railway enforces all Prisma relationship constraints
5. **Data cleanup**: Old test jobs should be cleaned up periodically to avoid clutter

## Troubleshooting

### Connection Issues

**Problem**: "Can't reach database server"
```bash
# Check if Railway DB is accessible
node scripts/cleanup-railway-db.js
```

**Solution**: Verify Railway database is running in the Railway dashboard

### Migration Issues

**Problem**: "Migration failed"
```bash
# Check migration status
pnpm exec prisma migrate status
```

**Solution**: Ensure DATABASE_URL is correct and database is accessible

### Test Failures

**Problem**: Tests failing with real DB
```bash
# Run tests with Mock DB
pnpm test
# (automatically uses USE_MOCK_DB=true)
```

**Solution**: Tests are configured to use Mock DB by default

## Next Steps

- ✅ T-008 PostgreSQL Integration: **COMPLETE**
- 🔄 T-009 History Page: Next task
- 🔄 T-010 Error Handling UI: Pending
- 🔄 T-011 Basic Monitoring: Pending

## Additional Resources

- [Railway Dashboard](https://railway.app)
- [Prisma Migrate Docs](https://www.prisma.io/docs/concepts/components/prisma-migrate)
- [BridgeFlow Testing Guide](./instructions/TESTING.md)
- [UI Testing Guide](./instructions/UI-TESTING.md)

---

**Setup completed**: 2025-12-16
**Database**: Railway PostgreSQL
**Status**: ✅ Operational
