# Firewall API + Canvas Integration Roadmap

**Status:** API complete (Phase 33 Part 1), Canvas integration pending (Phase 32 final push)

## Current State

### ✅ Completed (Phase 33 Part 1)

1. **Prisma Model** - Firewall entity with Layer 4 security fields
2. **API Endpoints** - POST/GET/DELETE handlers with full RBAC + tenancy
3. **Validation** - Security-first IP/port/protocol validators
4. **Tests** - 20 comprehensive unit tests (all passing)
5. **Migration** - Database schema applied
6. **Documentation** - Complete specification

### ⏳ Next: Canvas Integration (Phase 32 Final)

The firewall API is now ready for Canvas UI integration. When a user activates a bridge in Canvas, the firewall creation flow should follow the same pattern as Trading Partners and Connectors.

## Canvas Integration Pattern

### Template: How TPs/Connectors Are Added

```javascript
// In assembly.js - existing pattern for TPs
const urlParams = new URLSearchParams(window.location.search)
const newTpId = urlParams.get('newTpId')

if (newTpId) {
  // Fetch TP details
  const tp = await fetch(`/api/trading-partners/${newTpId}`).then(r => r.json())
  
  // Add to palette
  palette.addTradingPartner(tp, {
    highlight: true,
    fadeOutAfter: 2500 // 2.5 second highlight
  })
}
```

### Same Pattern for Firewalls

```javascript
// In assembly.js - firewall pattern (ready to implement)
const urlParams = new URLSearchParams(window.location.search)
const newFirewallId = urlParams.get('newFirewallId')

if (newFirewallId) {
  // Fetch firewall details
  const fw = await fetch(`/api/firewalls/${newFirewallId}`, {
    credentials: 'include' // Cookie-based auth
  }).then(r => r.json())
  
  // Add to palette with status indicator
  palette.addFirewall(fw, {
    highlight: true,
    fadeOutAfter: 2500,
    statusIndicator: fw.status // "PROVISIONING", "ACTIVE", "ERROR"
  })
  
  // Poll status until ACTIVE
  const pollStatus = async (id) => {
    while (true) {
      const updated = await fetch(`/api/firewalls/${id}`, {
        credentials: 'include'
      }).then(r => r.json())
      
      if (updated.status === 'ACTIVE' || updated.status === 'ERROR') {
        // Update UI indicator
        palette.updateFirewallStatus(id, updated.status)
        break
      }
      
      // Wait 2 seconds before next poll
      await new Promise(resolve => setTimeout(resolve, 2000))
    }
  }
  
  // Start polling in background
  pollStatus(newFirewallId).catch(err => console.error('Poll failed:', err))
}
```

## Data Flow Diagram

```
┌──────────────────────────────────┐
│  Canvas UI (web/src/assembly.js) │
│  User clicks "Add Firewall"      │
└──────────┬───────────────────────┘
           │
           ├─→ POST /api/firewalls
           │   {
           │     bridgeId: "...",
           │     side: "inbound",
           │     publicIp: "203.0.113.45",
           │     allowedPorts: [80, 443, 8080],
           │     protocol: "tcp"
           │   }
           │
           ├─→ Returns: { id: "fw_123", status: "PROVISIONING" }
           │
           ├─→ Redirect: ?newFirewallId=fw_123
           │
           └─→ Canvas Detects URL Param
               │
               ├─→ GET /api/firewalls/fw_123
               │
               ├─→ Add to palette with highlight
               │
               └─→ Poll GET /api/firewalls/fw_123 every 2s
                   │
                   ├─→ Status: PROVISIONING (show spinner)
                   ├─→ Status: ACTIVE (show checkmark, persist)
                   └─→ Status: ERROR (show alert, allow delete)

                       [Async Job in Background]
                       ├─→ Validate IP reachability
                       ├─→ Apply firewall rules
                       ├─→ Test port connectivity
                       └─→ Update status in DB
```

## Canvas Rendering Requirements

### Firewall Card Component (to be added)

```javascript
class FirewallCard extends Component {
  // Display firewall configuration on bridge
  render() {
    return `
      <div class="firewall-card">
        <span class="side">${this.firewall.side}</span>
        <span class="ip">${this.firewall.publicIp}</span>
        <span class="ports">${this.firewall.allowedPorts.join(',')}</span>
        <span class="protocol">${this.firewall.protocol}</span>
        <span class="status-indicator ${this.firewall.status}">
          ${this.statusIcon()} ${this.firewall.status}
        </span>
      </div>
    `
  }
  
  statusIcon() {
    switch (this.firewall.status) {
      case 'PROVISIONING': return '⏳'
      case 'ACTIVE': return '✅'
      case 'ERROR': return '❌'
      default: return '?'
    }
  }
}
```

### Firewall Form Component (to be added)

```javascript
class FirewallForm extends Component {
  // User enters firewall details
  fields = {
    side: { type: 'radio', options: ['inbound', 'outbound'] },
    publicIp: { type: 'text', placeholder: '203.0.113.45' },
    allowedPorts: { type: 'list', placeholder: 'Comma-separated ports' },
    protocol: { type: 'radio', options: ['tcp', 'udp', 'both'] }
  }
  
  onSubmit(data) {
    // Validate on client side first
    const errors = this.validate(data)
    if (errors.length > 0) {
      this.showErrors(errors)
      return
    }
    
    // POST to API
    fetch('/api/firewalls', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({
        bridgeId: this.bridgeId,
        ...data
      })
    })
    .then(r => r.json())
    .then(fw => {
      // Redirect to trigger auto-add to palette
      window.location.search = `?newFirewallId=${fw.id}`
    })
    .catch(err => this.showError(err.message))
  }
  
  validate(data) {
    const errors = []
    
    // Check side
    if (!['inbound', 'outbound'].includes(data.side)) {
      errors.push('Side must be "inbound" or "outbound"')
    }
    
    // Check IP
    if (!/^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(data.publicIp)) {
      errors.push('Invalid IP address format')
    }
    
    // Check ports
    if (!data.allowedPorts || data.allowedPorts.length === 0) {
      errors.push('At least one port is required')
    }
    
    // Check protocol
    if (!['tcp', 'udp', 'both'].includes(data.protocol)) {
      errors.push('Protocol must be "tcp", "udp", or "both"')
    }
    
    return errors
  }
}
```

## API Integration Checklist (for Canvas dev)

- [ ] Add firewall form component to Canvas
- [ ] Add firewall card component to bridge rendering
- [ ] Detect `?newFirewallId` URL parameter
- [ ] Fetch firewall details from API
- [ ] Add firewall to palette with animation
- [ ] Implement polling for status updates (2s intervals)
- [ ] Show status indicator (spinner, checkmark, alert)
- [ ] Handle errors (display message, allow delete)
- [ ] Persist firewall state in bridge config
- [ ] Test full activation flow end-to-end

## Error Handling in Canvas

The API returns structured errors that Canvas should handle:

```javascript
// Example: Create firewall with private IP (rejected by API)
POST /api/firewalls
{
  bridgeId: "...",
  publicIp: "10.0.0.1",  // Private range!
  side: "inbound",
  allowedPorts: [443],
  protocol: "tcp"
}

// API Response (400 Bad Request)
{
  code: "INVALID_IP",
  message: "Private IP range 10.0.0.0/8 not allowed"
}

// Canvas should display:
// "⚠️ Private IP range 10.0.0.0/8 not allowed — use public IP"
```

## Testing Checklist for Canvas Integration

### Manual Testing
- [ ] Create inbound firewall (PROVISIONING → ACTIVE)
- [ ] Create outbound firewall (PROVISIONING → ACTIVE)
- [ ] Try creating duplicate firewall on same side (409 Conflict)
- [ ] Try invalid IP (400 Bad Request)
- [ ] Try invalid port (400 Bad Request)
- [ ] Delete active firewall (status becomes DELETED)
- [ ] View firewall details in palette
- [ ] View all firewalls for a bridge (GET /api/bridges/:id/firewalls)

### Automated Testing
- [ ] E2E test: Create bridge → add firewall → activate → verify status
- [ ] E2E test: Create firewall → delete → verify not in list
- [ ] E2E test: Create duplicate → verify 409 error

## API Documentation (for frontend engineers)

### POST /api/firewalls
**Create a firewall rule set**

```
POST /api/firewalls
Content-Type: application/json
Authorization: Bearer <jwt>
X-Idempotency-Key: <optional>

{
  "bridgeId": "userbridge_123",
  "side": "inbound",              // "inbound" or "outbound"
  "publicIp": "203.0.113.45",     // External IP (no private ranges)
  "allowedPorts": [80, 443, 8080], // Array of integers 1-65535
  "protocol": "tcp"                // "tcp", "udp", or "both"
}

Response (201 Created):
{
  "id": "fw_456",
  "bridgeId": "userbridge_123",
  "side": "inbound",
  "publicIp": "203.0.113.45",
  "allowedPorts": [80, 443, 8080],
  "protocol": "tcp",
  "status": "PROVISIONING"
}

Error (400 Bad Request):
{
  "code": "INVALID_IP",
  "message": "Private IP range 10.0.0.0/8 not allowed"
}

Error (409 Conflict):
{
  "code": "FIREWALL_EXISTS",
  "message": "A inbound firewall already exists for this bridge"
}
```

### GET /api/firewalls/:id
**Fetch a single firewall**

```
GET /api/firewalls/fw_456
Authorization: Bearer <jwt>

Response (200 OK):
{
  "id": "fw_456",
  "bridgeId": "userbridge_123",
  "side": "inbound",
  "publicIp": "203.0.113.45",
  "allowedPorts": [80, 443, 8080],
  "protocol": "tcp",
  "status": "ACTIVE",  // Status updates as job runs
  "createdAt": "2026-01-11T03:45:00Z"
}

Error (404 Not Found):
{
  "code": "FIREWALL_NOT_FOUND",
  "message": "Firewall not found or access denied"
}
```

### GET /api/bridges/:bridgeId/firewalls
**List all firewalls for a bridge**

```
GET /api/bridges/userbridge_123/firewalls
Authorization: Bearer <jwt>

Response (200 OK):
{
  "firewalls": [
    {
      "id": "fw_456",
      "side": "inbound",
      "publicIp": "203.0.113.45",
      "allowedPorts": [80, 443, 8080],
      "protocol": "tcp",
      "status": "ACTIVE"
    },
    {
      "id": "fw_789",
      "side": "outbound",
      "publicIp": "198.51.100.50",
      "allowedPorts": [443],
      "protocol": "tcp",
      "status": "PROVISIONING"
    }
  ]
}
```

### DELETE /api/firewalls/:id
**Delete a firewall rule set**

```
DELETE /api/firewalls/fw_456
Authorization: Bearer <jwt>

Response (204 No Content):
(empty body)

Error (404 Not Found):
{
  "code": "FIREWALL_NOT_FOUND",
  "message": "Firewall not found or access denied"
}
```

## Next Steps

1. **Canvas Team:** Implement firewall form + card components
2. **Canvas Team:** Add `?newFirewallId` URL parameter detection
3. **Canvas Team:** Implement polling for status updates
4. **API Team:** Implement async provisioning job (enqueue in queue)
5. **API Team:** Apply firewall rules to Layer 4 infrastructure
6. **QA Team:** End-to-end test firewall activation flow

## References

- API Implementation: [api/handlers/firewalls.js](../../handlers/firewalls.js)
- Validators: [api/validators/firewall.js](../../validators/firewall.js)
- Tests: [api/tests/firewalls.test.js](../../tests/firewalls.test.js)
- Database Schema: [prisma/schema.prisma](../../schema.prisma)
- Phase 32 Plan: [docs/phases/phases31-40/phase-32-plan.md](../phases31-40/phase-32-plan.md)
