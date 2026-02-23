# Phase 29: Organizations & Tenets Specification

## 🎯 Executive Summary
Phase 29 establishes the core organizational model and tenet enforcement that underpins the entire BridgeFlow platform. This is a foundational architectural layer that ensures proper data isolation, security, and scalability.

## 🔑 Core Tenets (Non-Negotiable)

| Tenet | Enforcement Layer | Implementation |
|-------|-------------------|----------------|
| Regular users belong to exactly one org | DB constraint + API validation | `isBfEmployee=false` → single UserOrganization record |
| bf_employees can belong to many orgs | Flexible join table + special RBAC | `isBfEmployee=true` → multiple UserOrganization records |
| All data queries scoped to org(s) | Middleware + Prisma filters | Automatic org filtering in all data access |
| Org isolation is default | Architecture, not opt-in | Default-deny, explicit allow per org |

## 📊 Data Model Changes

### Prisma Schema Updates

```prisma
model User {
  id               String    @id @default(cuid())
  email            String    @unique
  name             String?
  password         String
  isBfEmployee     Boolean   @default(false) // 🔑 Critical flag
  isActive         Boolean   @default(true)
  createdAt        DateTime  @default(now())
  updatedAt        DateTime  @updatedAt
  
  // Relations
  userOrganizations UserOrganization[]
  userRoles         UserRole[]
  createdTps        TradingPartner[] @relation("TpCreator")
  auditLogs         AuditLog[]
  
  @@map("users")
}

model UserOrganization {
  id             String   @id @default(cuid())
  userId         String
  organizationId String
  role           UserRole @default(MEMBER)
  isActive       Boolean  @default(true)
  createdAt      DateTime @default(now())
  updatedAt      DateTime @updatedAt
  
  // Relations
  user         User         @relation(fields: [userId], references: [id], onDelete: Cascade)
  organization Organization @relation(fields: [organizationId], references: [id], onDelete: Cascade)
  
  @@unique([userId, organizationId]) // One membership per user per org
  @@map("user_organizations")
}

model Organization {
  id          String   @id @default(cuid())
  name        String
  slug        String   @unique
  isActive    Boolean  @default(true)
  isInternal  Boolean  @default(false) // BridgeFlow internal orgs
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  // Relations
  userOrganizations UserOrganization[]
  tradingPartners   TradingPartner[]
  auditLogs         AuditLog[]
  
  @@map("organizations")
}

enum UserRole {
  OWNER
  ADMIN
  MEMBER
}
```

## 🔐 Authentication & Middleware Architecture

### Enhanced Auth Middleware

```javascript
// lib/authMiddleware.js
export async function authMiddleware(request, reply) {
  const token = extractToken(request)
  if (!token) return reply.status(401).send({ error: 'Unauthorized' })
  
  const user = await verifyToken(token)
  if (!user || !user.isActive) {
    return reply.status(401).send({ error: 'Invalid or inactive user' })
  }
  
  // 🔑 Critical: Resolve user's accessible organizations
  if (user.isBfEmployee) {
    // bf_employees can access multiple orgs
    user.accessibleOrgs = await prisma.userOrganization.findMany({
      where: { userId: user.id, isActive: true },
      include: { organization: true }
    })
  } else {
    // Regular users get exactly one org
    const userOrg = await prisma.userOrganization.findFirst({
      where: { userId: user.id, isActive: true },
      include: { organization: true }
    })
    
    if (!userOrg) {
      return reply.status(403).send({ error: 'User not assigned to any organization' })
    }
    
    user.accessibleOrgs = [userOrg]
  }
  
  request.user = user
  request.orgIds = user.accessibleOrgs.map(uo => uo.organizationId)
}
```

### Org Scoping Middleware

```javascript
// lib/orgScope.js
export function addOrgScope(prisma, orgIds) {
  return {
    ...prisma,
    tradingPartner: {
      ...prisma.tradingPartner,
      findMany: (args) => prisma.tradingPartner.findMany({
        ...args,
        where: { 
          ...args.where, 
          organizationId: { in: orgIds }
        }
      }),
      findUnique: (args) => prisma.tradingPartner.findUnique({
        ...args,
        where: { 
          ...args.where, 
          organizationId: { in: orgIds }
        }
      }),
      create: (args) => prisma.tradingPartner.create({
        ...args,
        data: {
          ...args.data,
          organizationId: orgIds[0] // For bf_employees, require explicit org selection
        }
      })
    }
  }
}
```

## 🏗️ API Changes

### Updated Endpoints

| Endpoint | Change | Description |
|----------|--------|-------------|
| `POST /api/auth/login` | Enhanced | Returns `isBfEmployee` flag and org context |
| `GET /api/auth/me` | Enhanced | Returns user's accessible organizations |
| `GET /api/trading-partners` | Scoped | Automatically filtered by user's orgs |
| `POST /api/trading-partners` | Scoped | Requires explicit `organizationId` for bf_employees |
| `GET /api/organizations` | New | List orgs (bf_employees only) |
| `POST /api/organizations` | Admin | Create new organization |

### Example: Scoped Trading Partners

```javascript
// handlers/tradingPartners.js
export async function listTradingPartners(request, reply) {
  const scopedPrisma = addOrgScope(prisma, request.orgIds)
  
  const partners = await scopedPrisma.tradingPartner.findMany({
    include: { organization: true }
  })
  
  return reply.send({ partners })
}
```

## 🎨 UI/UX Changes

### Enhanced Admin Panel

#### Regular User Org Management
```jsx
// Single org assignment for regular users
function UserOrgAssignment({ user }) {
  return (
    <div>
      <label>Organization Assignment</label>
      <select value={user.organizationId} onChange={handleOrgChange}>
        {organizations.map(org => (
          <option key={org.id} value={org.id}>{org.name}</option>
        ))}
      </select>
    </div>
  )
}
```

#### bf_employee Org Management
```jsx
// Multi-org assignment for bf_employees
function BfEmployeeOrgAssignment({ user }) {
  return (
    <div>
      <label>Organization Access</label>
      <MultiSelect
        options={organizations}
        selected={user.organizationIds}
        onChange={handleMultiOrgChange}
        placeholder="Select organizations..."
      />
    </div>
  )
}
```

### User Type Detection
```jsx
// Dynamic UI based on user type
function UserManagement() {
  const { user } = useAuth()
  
  return (
    <div>
      {user.isBfEmployee ? (
        <BfEmployeeOrgAssignment user={user} />
      ) : (
        <RegularUserOrgAssignment user={user} />
      )}
    </div>
  )
}
```

## 🧪 Testing Strategy

### Core Test Scenarios

1. **Regular User Org Isolation**
   - User can only see their own org's data
   - Cannot access other orgs' trading partners
   - Cannot be assigned to multiple orgs

2. **bf_employee Multi-Org Access**
   - Can access all assigned orgs
   - Can switch between org contexts
   - Cannot access unassigned orgs

3. **Data Scoping Validation**
   - All API endpoints properly filter by org
   - No data leakage between orgs
   - Audit logs properly scoped

4. **Migration Compatibility**
   - Existing users properly categorized
   - Data integrity maintained
   - No breaking changes to existing functionality

## 📋 Implementation Plan

### Phase 29.1: Data Model & Migration (2 days)
- [ ] Update Prisma schema
- [ ] Create migration script
- [ ] Add `isBfEmployee` flag to existing users
- [ ] Migrate existing user-org relationships

### Phase 29.2: Auth Middleware (2 days)
- [ ] Implement enhanced auth middleware
- [ ] Add org scoping utilities
- [ ] Update token verification
- [ ] Add user type detection

### Phase 29.3: API Updates (3 days)
- [ ] Update all data endpoints with org scoping
- [ ] Add organization management endpoints
- [ ] Update authentication responses
- [ ] Add bf_employee specific endpoints

### Phase 29.4: UI/UX Updates (2 days)
- [ ] Update admin panel for org management
- [ ] Add user type indicators
- [ ] Implement multi-org selection
- [ ] Update navigation and permissions

### Phase 29.5: Testing & Validation (2 days)
- [ ] Comprehensive test suite
- [ ] Security validation
- [ ] Performance testing
- [ ] Documentation updates

## 🚨 Migration Strategy

### Existing User Migration

```javascript
// Migration script for existing users
async function migrateExistingUsers(prisma) {
  // 1. Add isBfEmployee flag
  await prisma.user.updateMany({
    data: { isBfEmployee: false }
  })
  
  // 2. Mark known bf_employees
  await prisma.user.updateMany({
    where: { 
      email: { 
        endsWith: '@bridgeflow.test' 
      } 
    },
    data: { isBfEmployee: true }
  })
  
  // 3. Ensure single org for regular users
  const regularUsers = await prisma.user.findMany({
    where: { isBfEmployee: false }
  })
  
  for (const user of regularUsers) {
    const existingOrgs = await prisma.userOrganization.findMany({
      where: { userId: user.id }
    })
    
    if (existingOrgs.length > 1) {
      // Keep only the first org, archive others
      await prisma.userOrganization.deleteMany({
        where: {
          userId: user.id,
          organizationId: { not: existingOrgs[0].organizationId }
        }
      })
    }
  }
}
```

## 📊 Success Metrics

- [ ] 100% of API endpoints properly scoped by organization
- [ ] Zero data leakage between organizations
- [ ] All existing functionality preserved
- [ ] bf_employees can access multiple organizations
- [ ] Regular users restricted to single organization
- [ ] Performance impact < 5% on query execution

## 🔄 Rollback Plan

If critical issues arise:
1. Database backup before migration
2. Feature flags to disable org scoping
3. Revert to previous auth middleware
4. Restore from backup if necessary

---

**Total Estimated Effort: 11 days**
**Priority: Critical (Blocks Phase 28)**
**Risk Level: Medium (Database changes)**
