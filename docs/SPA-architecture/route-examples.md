# Route Module Examples

This document provides real-world examples of route modules from BridgeFlow.

## Simple Static Route

**File:** `web/src/routes/admin-partner-queue.js`

```javascript
export function render() {
  return `
    <h1>Partner Queue</h1>
    <p>Coming soon — partner onboarding queue.</p>
  `
}

export function init() {}
export function cleanup() {}
```

**Use case:** Placeholder page with no interactivity.

---

## Route with API Data

**File:** `web/src/routes/infrastructure.js`

```javascript
export function render() {
  return `
    <h1>5. Infrastructure</h1>
    <div id="infra-stats">Loading...</div>
    <button id="refresh-infra">Refresh Stats</button>
  `
}

export function init() {
  const statsDiv = document.getElementById('infra-stats')
  const refreshBtn = document.getElementById('refresh-infra')
  
  async function fetchStats() {
    statsDiv.textContent = 'Loading...'
    try {
      const res = await fetch('/api/infra/health')
      if (!res.ok) throw new Error('Forbidden or error')
      const data = await res.json()
      statsDiv.textContent = JSON.stringify(data, null, 2)
    } catch (e) {
      statsDiv.textContent = 'Error loading stats.'
    }
  }
  
  refreshBtn.addEventListener('click', fetchStats)
  fetchStats()
}
```

**Use case:** Fetch and display data from API, with refresh button.

---

## Route with Dynamic Imports

**File:** `web/src/routes/canvas-assembly.js`

```javascript
export function render() {
  return `
    <link rel="stylesheet" href="/css/assembly.css">
    <div class="canvas-container">
      <div class="canvas-palette">
        <h3>Components</h3>
        <!-- Palette UI -->
      </div>
      <div class="assembly-area">
        <div id="assembly-workspace" class="assembly-workspace">
          <!-- Canvas workspace -->
        </div>
      </div>
      <div class="canvas-config">
        <!-- Configuration panel -->
      </div>
    </div>
  `
}

export async function init() {
  // Dynamically import heavy module only when needed
  try {
    const assemblyModule = await import('../assembly.js')
    console.log('[canvas-assembly] Assembly module loaded')
  } catch (e) {
    console.error('[canvas-assembly] Failed to load assembly.js:', e)
  }
}

export function cleanup() {
  console.log('[canvas-assembly] Cleanup called')
}
```

**Use case:** Large feature that should only load when page is accessed.

**Benefits:**
- Reduces initial bundle size
- Loads functionality on-demand
- Better performance for users who never visit this page

---

## Route with Parameters

**File:** `web/src/routes/tp-profile.js`

```javascript
export function render(tpId) {
  return `
    <div class="tp-profile">
      <h1>Trading Partner Profile</h1>
      <div id="tp-details">Loading profile for ${tpId}...</div>
    </div>
  `
}

export async function init(tpId) {
  const detailsDiv = document.getElementById('tp-details')
  
  try {
    const res = await fetch(`/api/trading-partners/${tpId}`)
    if (!res.ok) throw new Error('Not found')
    
    const partner = await res.json()
    detailsDiv.innerHTML = `
      <h2>${partner.name}</h2>
      <p>Status: ${partner.status}</p>
      <p>Contact: ${partner.contact_email}</p>
    `
  } catch (e) {
    detailsDiv.textContent = 'Error loading partner profile.'
  }
}
```

**Router registration:**

```javascript
// In web/src/router.js
const tpMatch = path.match(/^\/tp\/(.+?)\/profile$/)
if (tpMatch) {
  const id = decodeURIComponent(tpMatch[1])
  app.innerHTML = tpProfileRoute.render(id)
  if (tpProfileRoute.init) await tpProfileRoute.init(id)
  currentCleanup = tpProfileRoute.cleanup
  return
}
```

**Use case:** Detail pages with dynamic IDs in URL.

---

## Route with Complex State

**File:** `web/src/routes/trading-partners.js`

```javascript
// Module-level state
let partners = []
let filters = { search: '', status: 'all' }

export function render() {
  return `
    <div class="tp-list">
      <h1>Trading Partners</h1>
      <div class="filters">
        <input id="search-input" placeholder="Search..." value="${filters.search}">
        <select id="status-filter">
          <option value="all" ${filters.status === 'all' ? 'selected' : ''}>All</option>
          <option value="active" ${filters.status === 'active' ? 'selected' : ''}>Active</option>
          <option value="inactive" ${filters.status === 'inactive' ? 'selected' : ''}>Inactive</option>
        </select>
        <button id="clear-filters">Clear</button>
      </div>
      <div id="partner-list"></div>
    </div>
  `
}

export async function init() {
  await loadPartners()
  renderPartnerList()
  
  // Attach filter listeners
  document.getElementById('search-input').addEventListener('input', (e) => {
    filters.search = e.target.value
    renderPartnerList()
  })
  
  document.getElementById('status-filter').addEventListener('change', (e) => {
    filters.status = e.target.value
    renderPartnerList()
  })
  
  document.getElementById('clear-filters').addEventListener('click', () => {
    filters = { search: '', status: 'all' }
    document.getElementById('search-input').value = ''
    document.getElementById('status-filter').value = 'all'
    renderPartnerList()
  })
}

async function loadPartners() {
  const res = await fetch('/api/trading-partners')
  partners = await res.json()
}

function renderPartnerList() {
  const filtered = partners.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(filters.search.toLowerCase())
    const matchesStatus = filters.status === 'all' || p.status === filters.status
    return matchesSearch && matchesStatus
  })
  
  const listEl = document.getElementById('partner-list')
  listEl.innerHTML = filtered
    .map(p => `
      <div class="partner-card">
        <h3>${p.name}</h3>
        <p>${p.status}</p>
        <a href="/tp/${p.id}/profile">View Profile</a>
      </div>
    `)
    .join('')
}

export function cleanup() {
  // Reset state when leaving page
  partners = []
  filters = { search: '', status: 'all' }
}
```

**Use case:** List page with filtering, search, and local state management.

---

## Route with Modal

**File:** `web/src/routes/admin-users.js`

```javascript
let currentModal = null

export function render() {
  return `
    <div class="admin-users">
      <h1>User Management</h1>
      <button id="new-user-btn">+ New User</button>
      <div id="user-list"></div>
      
      <!-- Modal structure -->
      <div id="user-modal" class="modal hidden">
        <div class="modal-content">
          <h2 id="modal-title"></h2>
          <div id="modal-body"></div>
          <div class="modal-actions">
            <button id="modal-cancel">Cancel</button>
            <button id="modal-confirm">Save</button>
          </div>
        </div>
      </div>
    </div>
  `
}

export async function init() {
  await loadUsers()
  
  document.getElementById('new-user-btn').addEventListener('click', () => {
    showUserModal(null) // null = new user
  })
}

async function loadUsers() {
  const res = await fetch('/api/admin/users')
  const users = await res.json()
  
  const listEl = document.getElementById('user-list')
  listEl.innerHTML = users
    .map(u => `
      <div class="user-row">
        <span>${u.email}</span>
        <span>${u.role}</span>
        <button onclick="window.editUser('${u.id}')">Edit</button>
      </div>
    `)
    .join('')
}

function showUserModal(userId) {
  const modal = document.getElementById('user-modal')
  const title = document.getElementById('modal-title')
  const body = document.getElementById('modal-body')
  
  if (userId) {
    title.textContent = 'Edit User'
    // Load user data and populate form
  } else {
    title.textContent = 'New User'
    body.innerHTML = `
      <input id="user-email" placeholder="Email">
      <select id="user-role">
        <option>customer_admin</option>
        <option>bf_employee</option>
      </select>
    `
  }
  
  modal.classList.remove('hidden')
  
  // Wire up modal buttons
  document.getElementById('modal-cancel').onclick = () => {
    modal.classList.add('hidden')
  }
  
  document.getElementById('modal-confirm').onclick = async () => {
    // Save user logic
    await saveUser()
    modal.classList.add('hidden')
    await loadUsers() // Refresh list
  }
}

async function saveUser() {
  const email = document.getElementById('user-email').value
  const role = document.getElementById('user-role').value
  
  await fetch('/api/admin/users', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, role })
  })
}

// Expose for onclick handlers
window.editUser = (id) => showUserModal(id)

export function cleanup() {
  delete window.editUser
}
```

**Use case:** CRUD interface with modal dialogs.

---

## Route with Main Menu

**File:** `web/src/routes/main-menu.js`

```javascript
import { apiFetch } from '../apiClient.js'

export function render() {
  // Returns menu structure - called by router for root path
  const layers = getMenuItemsForRole(window.currentUser?.role)
  
  return `
    <div class="main-menu">
      <h1>BridgeFlow</h1>
      ${layers.map(layer => `
        <details open>
          <summary>${layer.layer}</summary>
          <div class="menu-items">
            ${layer.items.map(item => `
              <a href="${item.path}" class="menu-button">
                ${layer.short} ${item.label}
              </a>
            `).join('')}
          </div>
        </details>
      `).join('')}
    </div>
  `
}

export async function init() {
  // Fetch current user for RBAC
  try {
    const res = await fetch('/api/auth/me')
    if (res.ok) {
      window.currentUser = await res.json()
    }
  } catch (e) {
    console.error('Failed to fetch user:', e)
  }
}

export function cleanup() {
  delete window.currentUser
}

function getMenuItemsForRole(role) {
  const menuItems = [
    {
      layer: 'Layer 0 (Admin)',
      short: '0. Admin',
      roles: ['bf_employee'],
      items: [/* ... */]
    },
    // ... more layers
  ]
  
  return menuItems.filter(layer => {
    if (layer.roles.length === 0) return true
    return layer.roles.includes(role)
  })
}
```

**Use case:** Home page that adapts to user's role.

---

## Key Patterns

### Pattern 1: Loading States

```javascript
export function render() {
  return `<div id="content">Loading...</div>`
}

export async function init() {
  const el = document.getElementById('content')
  el.textContent = 'Loading...'
  
  const data = await fetchData()
  el.innerHTML = renderData(data)
}
```

### Pattern 2: Error Handling

```javascript
export async function init() {
  try {
    const res = await fetch('/api/endpoint')
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    const data = await res.json()
    renderSuccess(data)
  } catch (err) {
    renderError(err.message)
  }
}

function renderError(message) {
  document.getElementById('content').innerHTML = `
    <div class="error">
      <p>⚠️ ${message}</p>
      <button onclick="window.location.reload()">Retry</button>
    </div>
  `
}
```

### Pattern 3: Progressive Enhancement

```javascript
export function render() {
  // Render basic content immediately
  return `
    <h1>My Page</h1>
    <div id="static-content">
      <p>This content works without JavaScript</p>
    </div>
    <div id="dynamic-content"></div>
  `
}

export async function init() {
  // Enhance with dynamic data
  const data = await fetchData()
  document.getElementById('dynamic-content').innerHTML = renderDynamic(data)
}
```

### Pattern 4: Event Delegation

```javascript
export function init() {
  // Instead of attaching listener to each item
  document.getElementById('item-list').addEventListener('click', (e) => {
    const item = e.target.closest('.item')
    if (!item) return
    
    const id = item.dataset.id
    handleItemClick(id)
  })
}
```

### Pattern 5: Cleanup

```javascript
let intervalId = null

export function init() {
  // Start polling
  intervalId = setInterval(async () => {
    await refreshData()
  }, 5000)
}

export function cleanup() {
  // Stop polling when leaving page
  if (intervalId) {
    clearInterval(intervalId)
    intervalId = null
  }
}
```

---

## Common Mistakes

### ❌ Forgetting to export functions

```javascript
function render() { /* ... */ } // Missing 'export'
```

**Fix:**
```javascript
export function render() { /* ... */ }
```

### ❌ Not handling missing elements

```javascript
export function init() {
  document.getElementById('btn').addEventListener('click', handler)
  // Error if #btn doesn't exist!
}
```

**Fix:**
```javascript
export function init() {
  const btn = document.getElementById('btn')
  if (btn) btn.addEventListener('click', handler)
}
```

### ❌ Memory leaks from event listeners

```javascript
export function init() {
  window.addEventListener('resize', handleResize)
  // Never removed!
}
```

**Fix:**
```javascript
export function init() {
  window.addEventListener('resize', handleResize)
}

export function cleanup() {
  window.removeEventListener('resize', handleResize)
}
```

### ❌ Modifying global scope

```javascript
export function init() {
  window.myData = []
  // Pollutes global scope
}
```

**Fix:**
```javascript
let myData = [] // Module-scoped

export function cleanup() {
  myData = [] // Reset when leaving
}
```

---

## Testing Route Modules

```javascript
// test/routes/example.test.js
import { describe, it, expect } from 'vitest'
import * as exampleRoute from '../../web/src/routes/example.js'

describe('Example Route', () => {
  it('renders HTML', () => {
    const html = exampleRoute.render()
    expect(html).toContain('<h1>Example</h1>')
  })
  
  it('initializes without errors', async () => {
    document.body.innerHTML = exampleRoute.render()
    await expect(exampleRoute.init()).resolves.not.toThrow()
  })
})
```

---

**See also:**
- [README.md](./README.md) - SPA architecture overview
- [router-internals.md](./router-internals.md) - How the router works
