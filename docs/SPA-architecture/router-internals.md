# Router Internals

Deep dive into how BridgeFlow's router works under the hood.

## Router Lifecycle

```
Page Load
    ↓
main.js executes
    ↓
router.init() called
    ↓
Read window.location.pathname
    ↓
Match path to route
    ↓
Call route.render()
    ↓
Inject HTML into #app
    ↓
Call route.init()
    ↓
User clicks link
    ↓
Click intercepted
    ↓
Prevent default navigation
    ↓
Update #app with new content
    ↓
Push new URL to history
    ↓
Call new route.init()
```

## Core Functions

### `route(pathArg)`

Main routing function that matches URLs to route handlers.

```javascript
export async function route(pathArg) {
  // Run cleanup for previous page
  if (typeof currentCleanup === 'function') {
    try { 
      currentCleanup() 
    } catch (e) { 
      console.warn('router: cleanup failed', e) 
    }
    currentCleanup = null
  }

  // Get and normalize path
  const path = typeof pathArg === 'string' ? pathArg : window.location.pathname
  const normalized = (path || '').replace(/\/$/, '').replace(/\.html$/, '')

  // Get app container
  const app = document.getElementById('app') || document.body
  
  try {
    // Root path - show main menu
    if (normalized === '' || normalized === '/') {
      // Check auth first
      const res = await fetch('/api/auth/me')
      if (!res.ok) {
        window.location.href = '/login.html'
        return
      }
      
      app.innerHTML = renderMainMenu()
      if (typeof initMainMenu === 'function') initMainMenu()
      currentCleanup = typeof cleanupMainMenu === 'function' ? cleanupMainMenu : null
      return
    }

    // Match specific routes
    if (normalized === '/canvas-assembly') {
      app.innerHTML = canvasAssembly.render()
      if (canvasAssembly.init) await canvasAssembly.init()
      currentCleanup = canvasAssembly.cleanup
      return
    }
    
    // ... more route handlers
    
  } catch (err) {
    console.error('router: failed to route', err)
  }
}
```

**Key features:**
- Cleanup previous route before loading new one
- Normalize URLs (remove trailing slash, strip `.html`)
- Auth check for protected routes
- Async support for routes that load data
- Error handling

---

### `navigateTo(path)`

Programmatic navigation helper.

```javascript
export function navigateTo(path) {
  const next = path || '/'
  
  // Update URL without reload
  window.history.pushState({}, '', next)
  
  // Render new route
  route(next)
}
```

**Usage:**
```javascript
// From any route or component
window.router.navigateTo('/admin/users')
```

---

### `init()`

Initialize router on page load.

```javascript
export async function init() {
  return route(window.location.pathname + window.location.search)
}
```

Called automatically by `main.js` on `DOMContentLoaded`.

---

## Link Interception

Router intercepts all same-origin link clicks to enable SPA navigation.

```javascript
document.addEventListener('click', (e) => {
  try {
    // Ignore if default already prevented
    if (e.defaultPrevented) return
    
    // Only handle left-clicks with no modifiers
    if (e.button !== 0 || e.metaKey || e.ctrlKey || e.altKey || e.shiftKey) return
    
    // Find closest <a> element
    const link = e.target.closest && e.target.closest('a[href]')
    if (!link) return
    
    // Skip special links
    if (link.target === '_blank' || 
        link.hasAttribute('download') || 
        link.getAttribute('href')?.startsWith('mailto:')) return
    
    const href = link.getAttribute('href')
    if (!href) return
    
    // Parse URL
    let url
    try { 
      url = new URL(href, window.location.origin) 
    } catch (err) { 
      return 
    }
    
    // Only intercept same-origin links
    if (url.origin !== window.location.origin) return
    
    // Prevent full page reload
    e.preventDefault()
    
    // Navigate via router
    navigateTo(url.pathname + url.search)
  } catch (err) { 
    // Fail silently - let browser handle normally
  }
})
```

**What gets intercepted:**
- ✅ `<a href="/canvas-assembly">Canvas</a>`
- ✅ `<a href="/admin/users?page=2">Users</a>`
- ✅ `<a href="http://localhost:4000/bridges">Bridges</a>` (same origin)

**What gets ignored:**
- ❌ `<a href="https://google.com">External</a>` (different origin)
- ❌ `<a href="/file.pdf" download>Download</a>` (download attribute)
- ❌ `<a href="mailto:user@example.com">Email</a>` (mailto:)
- ❌ `<a href="/page" target="_blank">New Tab</a>` (target="_blank")
- ❌ Ctrl+Click, Cmd+Click (open in new tab/window)

---

## History API Integration

Router uses the browser's History API for URL management.

### Forward Navigation

```javascript
// User clicks link or calls navigateTo()
window.history.pushState({}, '', '/new-path')
route('/new-path')
```

**Effect:**
- URL changes to `/new-path`
- Browser history updated (back button works)
- Page does not reload

### Back/Forward Navigation

```javascript
window.addEventListener('popstate', () => {
  route(window.location.pathname + window.location.search)
})
```

**When triggered:**
- User clicks browser back button
- User clicks browser forward button
- `history.back()` or `history.forward()` called

**Effect:**
- Router re-renders appropriate route
- No page reload
- State preserved

---

## Path Normalization

Router normalizes URLs for consistent matching:

```javascript
const normalized = (path || '')
  .replace(/\/$/, '')        // Remove trailing slash
  .replace(/\.html$/, '')    // Remove .html extension
```

**Examples:**
- `/canvas-assembly/` → `/canvas-assembly`
- `/canvas-assembly.html` → `/canvas-assembly`
- `/admin/users/` → `/admin/users`
- `/` → `` (empty string for root)

**Why normalize?**
- Users may type URLs with or without trailing slash
- Legacy links may include `.html`
- Consistent matching prevents duplicate route handlers

---

## Route Registration Patterns

### Simple Route

```javascript
if (normalized === '/my-route') {
  app.innerHTML = myRoute.render()
  if (myRoute.init) await myRoute.init()
  currentCleanup = myRoute.cleanup
  return
}
```

### Parameterized Route

```javascript
// Match pattern: /tp/123/profile
const tpMatch = path.match(/^\/tp\/(.+?)\/profile$/)
if (tpMatch) {
  const id = decodeURIComponent(tpMatch[1])
  app.innerHTML = tpProfileRoute.render(id)
  if (tpProfileRoute.init) await tpProfileRoute.init(id)
  currentCleanup = tpProfileRoute.cleanup
  return
}
```

### Dynamic Import Route

```javascript
if (normalized === '/bridges') {
  const mod = await import('../src/bridges.js')
  app.innerHTML = mod.render ? mod.render() : ''
  if (mod.init) await mod.init()
  currentCleanup = mod.cleanup
  return
}
```

**When to use dynamic imports:**
- Large modules (e.g., charting libraries)
- Rarely-accessed pages
- Feature-specific code

**Benefits:**
- Smaller initial bundle
- Faster initial load
- Code splitting

---

## Cleanup Mechanism

Router calls cleanup before navigating to new route:

```javascript
let currentCleanup = null

export async function route(pathArg) {
  // Call previous cleanup
  if (typeof currentCleanup === 'function') {
    try { 
      currentCleanup() 
    } catch (e) { 
      console.warn('router: cleanup failed', e) 
    }
    currentCleanup = null
  }
  
  // ... route to new page
  
  // Store new cleanup function
  currentCleanup = newRoute.cleanup
}
```

**Cleanup use cases:**
- Remove event listeners: `window.removeEventListener('resize', handler)`
- Clear intervals: `clearInterval(intervalId)`
- Abort fetch requests: `controller.abort()`
- Reset global state: `delete window.myVar`

---

## Error Handling

Router catches errors to prevent crashes:

```javascript
try {
  // Route matching logic
} catch (err) {
  console.error('router: failed to route', err)
  // Page remains at current route
}
```

**Best practices:**
- Route modules should handle their own errors
- Display user-friendly error messages
- Log errors for debugging

```javascript
export async function init() {
  try {
    const data = await fetchData()
    renderData(data)
  } catch (err) {
    console.error('Failed to load data:', err)
    document.getElementById('content').innerHTML = `
      <div class="error">
        <p>⚠️ Failed to load page</p>
        <button onclick="location.reload()">Retry</button>
      </div>
    `
  }
}
```

---

## Global Router Object

Router exposes itself globally for convenience:

```javascript
window.router = { 
  navigateTo, 
  init,
  route  // Optional: expose for debugging
}
```

**Usage from anywhere:**
```javascript
// In route modules
window.router.navigateTo('/new-page')

// In event handlers
button.onclick = () => window.router.navigateTo('/dashboard')

// From browser console (debugging)
window.router.route('/admin/users')
```

---

## Authentication Flow

Router handles auth at the root route:

```javascript
if (normalized === '' || normalized === '/') {
  // Check if user is authenticated
  try {
    const res = await fetch('/api/auth/me')
    if (!res.ok) {
      // Not authenticated - redirect to login
      window.location.href = '/login.html'
      return
    }
  } catch (e) {
    // Network error - redirect to login
    window.location.href = '/login.html'
    return
  }
  
  // Authenticated - show menu
  app.innerHTML = renderMainMenu()
  initMainMenu()
  return
}
```

**Flow:**
1. User loads `http://localhost:4000/`
2. Router checks `/api/auth/me`
3. If 401 → redirect to `/login.html`
4. If 200 → render main menu

**Individual routes** can also check auth:

```javascript
export async function init() {
  const res = await fetch('/api/auth/me')
  if (!res.ok) {
    window.location.href = '/login.html'
    return
  }
  // Continue with page logic
}
```

---

## Fallback Handling

Fastify server serves `index.html` for all unmatched routes:

```javascript
// api/server.js
app.setNotFoundHandler((req, reply) => {
  if (req.method === 'GET' && !req.url.startsWith('/api/')) {
    reply.sendFile('index.html')
  } else {
    reply.code(404).send({ error: 'Not Found' })
  }
})
```

**Effect:**
- `/canvas-assembly` → serves `index.html`
- Router reads URL, renders canvas-assembly route
- Works for direct URL access and browser refresh

---

## Debugging

### Enable router logging

```javascript
// Temporarily add to router.js
export async function route(pathArg) {
  console.log('[ROUTER] Routing to:', pathArg)
  
  if (typeof currentCleanup === 'function') {
    console.log('[ROUTER] Calling cleanup')
    currentCleanup()
  }
  
  // ... rest of function
}
```

### Inspect current route

```javascript
// In browser console
console.log(window.location.pathname)
```

### Manually trigger route

```javascript
// In browser console
window.router.route('/admin/users')
```

### View app container

```javascript
// In browser console
console.log(document.getElementById('app').innerHTML)
```

---

## Performance Considerations

### Bundle Size

Router is included in main bundle (~80KB total).

**Optimization strategies:**
- Use dynamic imports for large features
- Code splitting per route (future enhancement)
- Tree shaking unused route modules

### Navigation Speed

SPA navigation is ~10-50ms (vs 200-500ms for full page load).

**Bottlenecks:**
- Large `render()` functions → use templates
- Slow `init()` → defer non-critical work
- Heavy DOM manipulation → batch updates

### Memory Management

**Potential leaks:**
- Event listeners not removed in `cleanup()`
- Global variables not reset
- Intervals/timeouts not cleared

**Prevention:**
- Always implement `cleanup()` for routes with listeners
- Use module-scoped variables instead of globals
- Clear timers before navigating away

---

## Future Enhancements

### Planned improvements:

1. **Route guards**
   ```javascript
   routes.add('/admin/*', { requireRole: 'bf_employee' })
   ```

2. **Route metadata**
   ```javascript
   export const meta = {
     title: 'Canvas Assembly',
     requireAuth: true
   }
   ```

3. **Nested routes**
   ```javascript
   /admin
     /admin/users
     /admin/metrics
   ```

4. **Lazy-loaded route config**
   ```javascript
   const routes = {
     '/canvas-assembly': () => import('./routes/canvas-assembly.js')
   }
   ```

5. **Route transitions**
   ```javascript
   app.classList.add('fade-out')
   await delay(200)
   app.innerHTML = newContent
   app.classList.add('fade-in')
   ```

---

**See also:**
- [README.md](./README.md) - SPA architecture overview
- [route-examples.md](./route-examples.md) - Real-world route examples
