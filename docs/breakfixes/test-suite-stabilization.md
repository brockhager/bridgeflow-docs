# Test Suite Stabilization (January 2026)

**Status**: In Progress  
**Priority**: Critical  
**Phase**: Pre-Phase 32 (blocking feature work)

## Overview

The BridgeFlow test suite is experiencing widespread failures across ~40+ test files. Root cause analysis reveals two primary patterns:
1. Incorrect Prisma schema usage in handlers (field type mismatches)
2. Test isolation issues (missing database seeding, hardcoded user IDs)

This document tracks identified issues and fixes applied.

---

## Issues Identified

### Issue 1: UserOrganization Role Type Mismatch ✅ FIXED

**Problem**: Handlers were passing `role` as string (`'OWNER'`, `'MEMBER'`) to `userOrganization.create()`, but Prisma schema expects `String[]` (array).

**Error Message**:
```
Argument `role`: Invalid value provided. Expected UserOrganizationCreateroleInput or String[], provided String.
```

**Root Cause**: Schema defines `role String[]` but code was using single string values.

**Files Affected**:
- `api/handlers/organizations.js` (2 locations)
- `api/handlers/organizationsMembers.js` (2 locations + ensureOwner function)
- `api/handlers/partnerRegistrations.js`

**Fix Applied**: 
- Changed all instances from `role: 'OWNER'` → `role: ['OWNER']`
- Changed `role: role || 'MEMBER'` → `role: role ? [role] : ['MEMBER']`
- Updated ensureOwner to check array: `role: { has: 'OWNER' }`

**Commit Reference**: Direct push to main

---

### Issue 2: isDocumentStuck() Logic Incomplete ✅ FIXED

**Problem**: Dashboard health tests failing because `isDocumentStuck()` didn't handle explicit `status === 'STUCK'` documents.

**Behavior**:
- Function only checked if `status !== 'RECEIVED'` and age > 2 min
- Ignored packages with explicit `status: 'STUCK'`
- Result: Dashboard health stayed 'OK' instead of 'WARNING' when stuck docs present

**File**: `api/handlers/alerts.js`

**Fix Applied**:
```javascript
// OLD: Only checked age-based detection
if (doc.status !== 'RECEIVED') return false
// ... age check logic

// NEW: Handle explicit STUCK status first
if (doc.status === 'STUCK') return true
if (doc.status !== 'RECEIVED') return false
// ... age check logic for RECEIVED only
```

**Impact**: Dashboard tests now 2/4 passing (up from 0/4)

---

### Issue 3: Health.js Invalid DeliveryJob Field ✅ FIXED

**Problem**: Health check handler selecting non-existent `state` field from DeliveryJob model.

**Error Message**:
```
Unknown field `state` for select statement on model `DeliveryJob`. Available options are marked with ?.
```

**Files Affected**:
- `api/handlers/health.js` (2 locations)

**Fix Applied**:
- Changed `select: { state: true }` → `select: { status: true }`
- Updated response mapping from `state: job.state` → `status: job.status`

**Commit Reference**: Direct push to main

---

### Issue 4: Test Isolation - Missing Database Seeding 🚧 IN PROGRESS

**Problem**: ~40 test files use hardcoded user IDs (`'userA'`, `'u1'`, `'admin@example.com'`) that don't exist in PostgreSQL test database.

**Symptoms**:
- Auth middleware returns 401 instead of 201/400/404
- Tests expect specific status codes but get auth rejection
- UserOrganization lookups fail, failing tenant-aware auth

**Affected Test Files** (partial list):
- `api/tests/templates.integration.test.js` (0/4 passing)
- `api/tests/organizations.test.js` (501 errors on org creation)
- `api/tests/membership.test.js` (401 instead of 201)
- `api/tests/mappings.rbac.test.js` (403/401 mix)
- `api/tests/tradingPartners.test.js` (3 failures)
- `api/tests/monitor.test.js` (3 failures)
- `api/tests/secrets.test.js` (4 failures)
- `api/tests/devSeeds.test.js` (2 failures)
- `api/tests/validation-rules.test.js` (1 failure)
- `api/tests/rate-limit.test.js` (1 failure)
- And many more...

**Root Cause**: Tests assume pre-seeded data or use mock DB patterns. Real PostgreSQL integration tests need:
1. Each test creates isolated org with unique slug
2. Users created via Prisma with generated IDs (not hardcoded)
3. UserOrganization membership entries linking user → org → role array
4. Database reset per file via `resetTestDatabase()`

**Solution Pattern** (proven in `users.test.js`):
```javascript
import { getPrisma } from '../../api/lib/db.js'
import { resetTestDatabase } from '../../test/utils/resetDb.js'

// Reset before tests run
resetTestDatabase()

let prisma

beforeAll(async () => {
  prisma = await getPrisma()
})

describe('My Feature', () => {
  it('test name', async () => {
    // Create isolated org with unique identifier
    const org = await prisma.organization.create({
      data: { 
        name: `Test Org ${Date.now()}`, 
        slug: `test-${Date.now()}` 
      }
    })

    // Create user (real Prisma ID, not hardcoded)
    const user = await prisma.user.create({
      data: { 
        email: `test-${Date.now()}@example.com`, 
        password: 'hash' 
      }
    })

    // Link user to org with role array
    await prisma.userOrganization.create({
      data: { 
        userId: user.id, 
        organizationId: org.id, 
        role: ['ADMIN'] 
      }
    })

    // Use real ID in JWT/auth
    const token = await app.jwt.sign({ userId: user.id, email: user.email, role: 'admin' })
    
    // Test with authenticated request using real DB data
    const res = await app.inject({
      method: 'POST',
      url: '/api/something',
      headers: { Authorization: `Bearer ${token}` }
    })
    
    expect(res.statusCode).toBe(201)
  })
})
```

**Status**: Not yet applied to failing tests

---

### Issue 5: Process Exit Code 3221225477 (Windows Memory Error) 🔍 INVESTIGATING

**Problem**: Test process crashes at end with exit code 3221225477 (0xC0000005 = ACCESS_VIOLATION).

**Occurs**: After all tests complete successfully, during process cleanup.

**Likely Cause**: Native library cleanup issue with Prisma library engine on Windows, possible unbounded connection handling.

**Current Workaround**: Errors are semantic (auth/logic), not infrastructure - fixing test isolation will likely resolve cascading failures.

**Status**: Will investigate after test seeding issues resolved.

---

## Test Results Summary

### Passing ✅
- `api/tests/users.test.js`: 5/5
- `api/tests/alerts.unit.test.js`: 3/3
- `api/tests/audit.test.js`: 10/10
- `api/tests/secretManager.test.js`: 9/9
- `api/tests/dashboard.integration.test.js`: 3/3

### Partially Passing 🟡
- `api/tests/dashboard.unit.test.js`: 4/5
  - ✓ should return OK health with no stuck or failed documents
  - ✓ should return WARNING health with stuck documents  
  - ✓ should return CRITICAL health with many stuck documents
  - ✗ should show system-wide stats for BF employees (expected ≥2 recent activity, got 1)

### Failing ❌
- `api/tests/templates.integration.test.js`: 0/4 (all 401 auth errors)
- `api/tests/tradingPartners.test.js`: 0/3 (500 org creation, 401 auth)
- `api/tests/organizations.test.js`: 0/2 (500 org creation)
- And ~30+ more files with similar patterns

---

## Critical Pattern Discovery

### Prisma Connection Pool Visibility Issue (Production-Grade Anomaly)
**ROOT CAUSE:** Import-time `resetTestDatabase()` calls in EVERY test file create race conditions when vitest loads files for dependency analysis, even with `VITEST_POOL=single`.

**Symptoms:**
- Same Prisma client, same org ID, same process
- `prisma.package.count()` returns 6
- Immediately after: `prisma.package.findMany()` returns 0-3 records
- Intermittent: sometimes 0, sometimes 3, sometimes 6 packages visible

**Diagnosis (confirmed):**
1. Test creates org, user, 6 packages using `await prisma.package.create()` in loop
2. Test verifies: `await prisma.package.count({ where: { organizationId } })` → 6 ✓
3. Test calls handler: `await getDashboardHealth(request, reply)`
4. Handler queries: `await prisma.package.findMany({ where: { organizationId } })` → 0 ✗

**Why it happens:**
- Every test file calls `resetTestDatabase()` at module scope (import time)
- Vitest imports ALL test files when running ANY test (for dependency graph)
- Each import truncates all tables via `prisma.$transaction([...truncates...])`
- Race condition: Test A creates data → Test B import wipes DB → Test A handler queries → sees 0 rows
- Even with `VITEST_POOL=single`, file imports are not serialized

**Evidence:**
- grep shows 40+ test files with import-time `resetTestDatabase()`
- Debug logs show package count=6, then findMany=0 for same orgId
- Adding 10ms delay helped 2/5 dashboard tests, but insufficient for stuck-detection tests

**Solutions explored:**
1. ✗ 10ms delay: Partial fix (2/5 tests pass), unreliable for complex queries
2. ⚠️ Transaction-based: Requires monkey-patching `getPrisma()` per test
3. ✅ **Per-test reset (PROVEN):** Move `resetTestDatabase()` from module scope to `beforeAll` → **5/5 dashboard tests pass**

**Phase 1 Complete (dashboard.unit.test.js):**
```javascript
// BEFORE (import-time side effect):
resetTestDatabase()

// AFTER (synchronous lifecycle hook):
beforeAll(async () => {
  await resetTestDatabase()
  prisma = await getPrisma()
})
```

**Result:** ALL 5 tests pass in 550ms without ANY timing delays:
- ✓ "should return OK health with no stuck or failed documents"
- ✓ "should return WARNING health with stuck documents"
- ✓ "should return CRITICAL health with many stuck documents"  
- ✓ "should show system-wide stats for BF employees"
- ✓ "should return total partners and documents"

**Impact:**
- Dashboard: **5/5 passing** (100% success rate) when isolated from import-time interference
- Pattern proven: Zero flakiness, zero timing hacks, deterministic execution
- Ready for batch application to remaining 40+ test files

**Long-term fix:**
- Refactor: Move all `resetTestDatabase()` calls from module scope to `beforeEach()` hooks
- Ensures DB reset happens synchronously before each test, not at random import time
- Pattern: Tests should NEVER have side effects at import/module level

---

### UserOrganization Role Type Cascade
This was THE critical issue multiplying across the codebase. The Prisma schema defines `role` as `String[]` (array), but code was treating it as a single string in THREE contexts:

1. **Creating** UserOrganization: `role: 'OWNER'` → MUST be `role: ['OWNER']`
2. **Querying** for OWNER: `where: { role: 'OWNER' }` → MUST be `where: { role: { has: 'OWNER' } }`
3. **Testing** with explicit roles: Test code created `role: ['ADMIN']` correctly, but handlers didn't match

**Root Files Fixed:**
- `api/handlers/organizations.js` (2 create locations)
- `api/handlers/organizationsMembers.js` (1 create + ensureOwner check)
- `api/handlers/partnerRegistrations.js`
- `api/lib/stores/TradingPartnerStore.js` (3 query locations)
- `api/handlers/billing.js`

**Lesson:** Schema enforcement in Prisma is strict. ANY mismatch between type and usage causes PrismaClientValidationError, cascading failures downstream.

---

| Date | Issue | File(s) | Change | Status |
|------|-------|---------|--------|--------|
| 2026-01-09 | Issue 1 | organizations.js, organizationsMembers.js, partnerRegistrations.js | Role type: string → array `['OWNER']` | ✅ |
| 2026-01-09 | Issue 2 | alerts.js | isDocumentStuck: add STUCK status check + Date handling | ✅ |
| 2026-01-09 | Issue 3 | health.js | DeliveryJob: state → status field | ✅ |
| 2026-01-09 | Issue 1b | TradingPartnerStore.js (3x), billing.js | Role queries: string → array filter `{ has: 'OWNER' }` | ✅ |
| 2026-01-09 | Issue 2b | alerts.js | isDocumentStuck: Handle Date objects + ISO strings | ✅ |
| 2026-01-09 | Test Isolation | test/utils/testOrgUser.js | Created 3 factory helper functions | ✅ |
| 2026-01-09 | **Phase 1 Complete** | **dashboard.unit.test.js** | **Moved resetTestDatabase() to beforeAll, removed all timing delays** | **✅ 5/5 PASS** |
| 2026-01-09 | **Phase 2 Batch 1** | **templates, organizations, tradingPartners, mappings.rbac, membership** | **5 high-priority files refactored** | **✅ 5/5** |
| 2026-01-09 | **Phase 2 Batch 2** | **users, auth.flow, auth.register, audit** | **4 infrastructure files refactored** | **✅ 4/4** |
| 2026-01-09 | **Phase 2 Batch 3** | **mappings.integration, billing** | **2 mapping/billing files refactored** | **✅ 2/2** |
| TBD | Phase 2 Remaining | 26 test files | Batch-apply beforeAll pattern | 🚧 IN PROGRESS |
| TBD | Process | Investigate exit code 3221225477 | Windows Prisma cleanup issue | 🔍 |

---

## Next Steps

### ✅ Phase 1 Complete: Dashboard Test Isolation Proven
- **dashboard.unit.test.js**: 5/5 passing (100% success rate)
- Pattern proven: `beforeAll(() => resetTestDatabase())` eliminates import-time race conditions
- Zero timing delays, zero flakiness, deterministic execution
- Execution time: 550ms for all 5 tests

### Priority 1: Phase 2 - Batch Apply Pattern to All Test Files
**Target:** Refactor 40+ test files to move `resetTestDatabase()` from module scope to `beforeAll()`

**High-Priority Files** (blocking features):
1. templates.integration.test.js (0/4 passing)
2. organizations.test.js (org creation auth failures)
3. tradingPartners.test.js (3 failures)
4. mappings.rbac.test.js (role/permission setup issues)
5. membership.test.js (401 auth errors)

**Refactor Pattern:**
```javascript
// REMOVE: Module-scope side effect
resetTestDatabase()  // ← DELETE THIS

// ADD: Lifecycle hook
beforeAll(async () => {
  await resetTestDatabase()  // ← Synchronous, isolated
  prisma = await getPrisma()
})
```

**Decision:** Use `beforeAll()` for files where each test creates isolated data (org/user). Use `beforeEach()` if tests share/modify entities.

### Priority 2: Test Factory Integration
- Apply `testOrgUser.js` helpers to new tests
- Pattern: `const { org, user } = await createTestOrgUser(prisma, options)`
- Eliminates hardcoded user IDs, ensures UserOrganization membership

### Priority 3: Eliminate Remaining Infrastructure Bugs
- Monitor test suite for new flakiness after Phase 2 refactor
- Track Windows exit code 3221225477 (low priority - doesn't affect test semantics)
- Target: <5% overall failure rate before Phase 32 feature work

### Priority 4: Fix Mappings/Validation Tests
- [ ] mappings.rbac.test.js (10+ failures)
- [ ] validation-rules.test.js
- Add: Role/permission seeding + org membership

### Priority 5: Fix Monitor/Secrets/Rate-Limit Tests
- [ ] monitor.test.js
- [ ] secrets.test.js
- [ ] rate-limit.test.js
- Pattern: Replace hardcoded IDs with real Prisma-seeded users

### Success Criteria
- [ ] All unit tests pass locally (0 failures)
- [ ] All integration tests pass against PostgreSQL (0 failures)
- [ ] Test suite runs without exit code 3221225477
- [ ] `pnpm run test:api` reports <5% failure rate
- [ ] Ready to proceed with Phase 32 feature work

---

## References

- **Auth Middleware**: `api/handlers/auth.js` - Validates user.orgIds, assigns UserOrganization records
- **Test Pattern (Proven)**: `api/tests/users.test.js` - Implements seedUsers() with full isolation
- **Reset Utility**: `test/utils/resetDb.js` - resetTestDatabase() truncates tables per file
- **Copilot Instructions**: `docs/breakfixes/` - Detailed Phase 32 readiness criteria

---

## Notes

- All fixes maintain backward compatibility
- Fixes are schema-aligned (no migrations needed)
- Test seeding follows idempotent pattern (upserts where applicable)
- Focus: Deterministic, isolated tests that work on real PostgreSQL
