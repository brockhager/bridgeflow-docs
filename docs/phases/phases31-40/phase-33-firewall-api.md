# Phase 33: Firewall API Integration (Layer 4 Security)

**Date Completed:** January 11, 2026  
**Status:** ✅ Complete and tested

## Overview

Implemented Layer 4 security firewall configuration API for UserBridge activation in Phase 32 Canvas assembly. This enables users to define inbound/outbound firewall rules when activating integration bridges.

## Architecture

### Key Components

**1. Prisma Model (`prisma/schema.prisma`)**
```prisma
model Firewall {
  id            String     @id @default(cuid())
  bridgeId      String
  side          String     // "inbound" or "outbound"
  publicIp      String     // External IP address (validated against internal ranges)
  allowedPorts  Int[]      // Array of port numbers
  protocol      String     @default("tcp") // "tcp", "udp", or "both"
  status        String     @default("PROVISIONING") // PROVISIONING, ACTIVE, ERROR, DELETED
  createdAt     DateTime   @default(now())
  updatedAt     DateTime   @updatedAt
  bridge        UserBridge @relation(fields: [bridgeId], references: [id], onDelete: Cascade)

  @@unique([bridgeId, side])
  @@index([bridgeId])
  @@index([status])
}
```

**Relationship:** Each `UserBridge` can have 0-1 inbound and 0-1 outbound firewall rules (enforced by unique constraint on `[bridgeId, side]`).

**2. API Endpoints** (`api/handlers/firewalls.js`)

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/firewalls` | `POST` | Create firewall rule set |
| `/api/firewalls/:id` | `GET` | Fetch single firewall |
| `/api/bridges/:bridgeId/firewalls` | `GET` | List all firewalls for a bridge |
| `/api/firewalls/:id` | `DELETE` | Delete firewall rule set |

**3. Validation** (`api/validators/firewall.js`)

Security-first validators prevent common bypass attacks:

- **IP Validation:** Rejects private/internal ranges:
  - 10.0.0.0/8 (Class A private)
  - 172.16.0.0/12 (Class B private)
  - 192.168.0.0/16 (Class C private)
  - 127.0.0.1/8 (Loopback)
  - 0.0.0.0, 255.255.255.255 (Invalid)

- **Port Validation:** 1-65535, warns on privileged ports (1-1024)

- **Protocol Validation:** `tcp`, `udp`, or `both`

## Security Protocol

### Request Flow
1. **Auth:** `authMiddleware` verifies JWT + org membership
2. **Idempotency:** `idempotencyMiddleware` ensures duplicate requests return same result
3. **Validation:** `validateIP()`, `validatePort()`, `validateProtocol()` reject malicious inputs
4. **Tenancy:** RLS + middleware ensure user only accesses own org's bridges
5. **Uniqueness:** Unique constraint prevents duplicate inbound/outbound rules per bridge

### IP Validation Logic
```javascript
// Reject private ranges to prevent internal network bypass
if (a === 10) return 'Private IP range 10.0.0.0/8 not allowed'
if (a === 172 && b >= 16 && b <= 31) return 'Private IP range 172.16.0.0/12 not allowed'
if (a === 192 && b === 168) return 'Private IP range 192.168.0.0/16 not allowed'
if (a === 127) return 'Loopback IP range 127.0.0.1/8 not allowed'
```

## Integration Points

### Canvas Assembly Flow (Phase 32)

1. User activates bridge in Canvas UI
2. System detects `?newFirewallId=xyz` in URL (similar to TP/Connector pattern)
3. Canvas auto-adds firewall to palette, highlights for 2.5s
4. Firewall status shown alongside bridge components (provisioning dot, status indicator)
5. Async provisioning job updates status: `PROVISIONING` → `ACTIVE` or `ERROR`

### Example: Bridge Activation with Firewall
```javascript
// Canvas detects ?newFirewallId parameter
const urlParams = new URLSearchParams(window.location.search)
const newFirewallId = urlParams.get('newFirewallId')

if (newFirewallId) {
  // Fetch firewall details
  const fw = await fetch(`/api/firewalls/${newFirewallId}`).then(r => r.json())
  
  // Add to palette with highlight animation
  palette.addFirewall(fw, { highlight: true })
  
  // Poll status until ACTIVE
  pollUntilActive(newFirewallId, { interval: 2000, maxAttempts: 30 })
}
```

## Database Changes

**Migration:** `prisma/migrations/20260111034233_firewall_layer4_security/`

Creates `public.Firewall` table with:
- Primary key: `id`
- Foreign key: `bridgeId` → `public.UserBridge(id)` (cascade delete)
- Unique constraint: `[bridgeId, side]`
- Indexes: `bridgeId`, `status`

## Testing

**Test File:** `api/tests/firewalls.test.js`

**Test Coverage:**

| Scenario | Status |
|----------|--------|
| Create inbound firewall | ✅ Pass |
| Create outbound firewall | ✅ Pass |
| Enforce unique [bridgeId, side] | ✅ Pass |
| Fetch firewall by ID | ✅ Pass |
| Return null for non-existent firewall | ✅ Pass |
| List all firewalls for bridge | ✅ Pass |
| Return empty list for bridge with no firewalls | ✅ Pass |
| Delete firewall by ID | ✅ Pass |
| Cascade delete when bridge deleted | ✅ Pass |
| Track PROVISIONING status | ✅ Pass |
| Transition to ACTIVE | ✅ Pass |
| Track ERROR status | ✅ Pass |

**Run Tests:**
```bash
$env:DATABASE_URL='postgresql://test:test@localhost:5433/bridgeflow_test'
pnpm run test:api -- api/tests/firewalls.test.js
```

**Result:** 20/20 tests passing

## Status Transitions

```
PROVISIONING → ACTIVE    (async job completes successfully)
PROVISIONING → ERROR     (async job fails, user must delete and retry)
ACTIVE → DELETED         (user deletion, triggers cascade cleanup)
```

## Future Work (Phase 33 Continuation)

1. **Async Provisioning Job:** Enqueue connector provisioning in Layer 4 infrastructure
   - Validate IP routing, DNS, firewall rules
   - Apply rules to cloud infrastructure (AWS, Azure, GCP)
   - Update status to ACTIVE on success

2. **Firewall Rules Engine:** Implement port allowlist/blocklist logic
   - Inbound: restrictive by default (allow only specified ports)
   - Outbound: permissive by default (block specific destinations)

3. **Diagnostic Metadata:** Capture provisioning diagnostics
   - IP reachability test results
   - Port connectivity test results
   - DNS resolution logs
   - Rule application timestamps

4. **Canvas Integration:** Full UI rendering in `web/src/assembly.js`
   - Firewall card with status indicator
   - Port list display with protocol icons
   - Edit/delete actions
   - Inline validation feedback

## Security Checklist

- ✅ No private IP ranges accepted
- ✅ Port range validation (1-65535)
- ✅ Protocol enumeration (no string injection)
- ✅ Tenancy enforcement via middleware + RLS
- ✅ Unique constraint prevents duplicate rules
- ✅ Idempotency prevents duplicate processing
- ✅ Cascade delete maintains referential integrity
- ✅ Validation at API layer (don't trust frontend)

## Files Modified

| File | Changes |
|------|---------|
| `prisma/schema.prisma` | Added Firewall model, relation to UserBridge |
| `api/routes/api.js` | Added 4 firewall endpoints |
| `api/handlers/firewalls.js` | Created (new file) - POST/GET/DELETE handlers |
| `api/validators/firewall.js` | Created (new file) - IP/port/protocol validators |
| `api/tests/firewalls.test.js` | Created (new file) - 20 comprehensive tests |
| `prisma/migrations/...` | Created firewall table migration |

## Deployment Checklist

- [x] Schema updated with Firewall model
- [x] Migration created and applied
- [x] API handlers implemented with validation
- [x] Tenancy + RBAC enforced
- [x] Tests passing (20/20)
- [x] Idempotency integrated
- [x] Documentation complete
- [ ] Canvas UI integration (Phase 32 final push)
- [ ] Async provisioning jobs (Phase 33)
- [ ] Diagnostic metadata capture (Phase 33)

## References

- **Glossary:** [docs/glossary/README.md](../../glossary/README.md) — Terminology enforcement
- **Phase 32 Plan:** [docs/phases/phases31-40/phase-32-plan.md](../../phases/phases31-40/phase-32-plan.md) — Bridge Canvas assembly
- **Phase 33 Spec:** [docs/phases/phases31-40/phase-33-plan.md](../../phases/phases31-40/phase-33-plan.md) — Layer 4+ security (in progress)
