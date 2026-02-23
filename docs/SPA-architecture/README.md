# Single Page Application (SPA) Architecture

## Overview

BridgeFlow uses a **pure Single Page Application (SPA)** architecture where all page navigation happens client-side without full page reloads. This provides a fast, app-like experience with smooth transitions between pages.

## What is a Single Page Application?

A Single Page Application is a web application that:
- Loads a single HTML document (`index.html`) on first visit
- Dynamically updates content by manipulating the DOM with JavaScript
- Uses the browser's History API to update the URL without reloading the page
- Fetches data from APIs (JSON) rather than server-rendered HTML

### Traditional Multi-Page App vs SPA

**Traditional (Multi-Page):**
```
User clicks link → Browser requests new HTML → Server renders page → Full page reload
```

**SPA (BridgeFlow):**
```
User clicks link → JavaScript intercepts → Updates DOM → Updates URL (no reload)
```

## BridgeFlow SPA Architecture

### Core Files

```
web/
├── index.html              # Single entry point - contains <div id="app">
├── login.html              # Standalone login page (not part of SPA)
├── dist/
│   └── main.js            # Bundled app including router and all routes
└── src/
    ├── main.js            # App entry point - starts the router
    ├── router.js          # Core routing logic - maps URLs to routes
    ├── main-menu.js       # Renders the main menu with RBAC filtering
    └── routes/
        ├── main-menu.js           # Home page / menu
        ├── canvas-assembly.js     # Canvas assembly page
        ├── admin-users.js         # Admin users page
        ├── infrastructure.js      # Infrastructure overview
        └── ...                    # Other route modules
```

### How It Works

1. **Initial Load**
   - User visits `http://localhost:4000`
   - Server sends `index.html` with empty `<div id="app">`
   - Browser loads and executes `main.js`
   - Router initializes and reads current URL

2. **Routing**
   - Router matches URL path to a route handler
   - Route module's `render()` function returns HTML string
   - HTML is injected into `<div id="app">`
   - Route module's `init()` function wires up event listeners

3. **Navigation**
   - User clicks a link like `<a href="/canvas-assembly">`
   - Router intercepts click via global event listener
   - Prevents default browser navigation
   - Updates `<div id="app">` with new content
   - Uses `history.pushState()` to update URL without reload

4. **Back/Forward**
   - User clicks browser back/forward
   - `popstate` event fires
   - Router re-renders appropriate route for the URL

## Route Module Pattern

Every page in BridgeFlow is defined as a route module with three functions:

```javascript
// web/src/routes/example.js

export function render() {
  // Returns HTML string to inject into #app
  return `
    <div class="example-page">
      <h1>Example Page</h1>
      <button id="my-button">Click Me</button>
    </div>
  `
}

export function init() {
  // Wire up event listeners after DOM is injected
  const btn = document.getElementById('my-button')
  btn.addEventListener('click', () => {
    alert('Button clicked!')
  })
}

export function cleanup() {
  // Optional: clean up listeners, timers, etc.
  console.log('Leaving example page')
}
```

### Lifecycle

```
Route matched
    ↓
cleanup() called on previous route
    ↓
render() called → HTML injected into #app
    ↓
init() called → event listeners attached
    ↓
User interacts with page
    ↓
User navigates away
    ↓
cleanup() called
```

## Router Implementation

### Registering Routes

Routes are registered in `web/src/router.js`:

```javascript
import * as myRoute from './routes/my-route.js'

export async function route(pathArg) {
  const path = pathArg || window.location.pathname
  const normalized = path.replace(/\/$/, '').replace(/\.html$/, '')
  
  if (normalized === '/my-route') {
    app.innerHTML = myRoute.render()
    if (myRoute.init) await myRoute.init()
    currentCleanup = myRoute.cleanup
    return
  }
  
  // ... other routes
}
```

### Link Interception

Router automatically intercepts same-origin links:

```javascript
document.addEventListener('click', (e) => {
  const link = e.target.closest('a[href]')
  if (!link) return
  
  const href = link.getAttribute('href')
  const url = new URL(href, window.location.origin)
  
  if (url.origin === window.location.origin) {
    e.preventDefault()
    navigateTo(url.pathname)
  }
})
```

### Programmatic Navigation

Navigate from JavaScript:

```javascript
// From any route module
window.router.navigateTo('/canvas-assembly')
```

## Menu System with RBAC

The main menu in `web/src/main-menu.js` dynamically filters items based on user role:

```javascript
// Menu items are organized by layer
const menuItems = [
  {
    layer: 'Layer 0 (Admin)',
    short: '0. Admin',
    roles: ['bf_employee'],  // Only visible to BridgeFlow employees
    items: [
      { label: 'Metrics', path: '/admin/metrics' },
      { label: 'Users', path: '/admin/users' }
    ]
  },
  {
    layer: 'Layer 1 (Business)',
    short: '1. Business',
    roles: [],  // Empty = visible to all authenticated users
    items: [
      { label: 'Canvas Assembly', path: '/canvas-assembly' },
      { label: 'Bridges', path: '/bridges' }
    ]
  }
]
```

## Adding a New Page

### Step 1: Create Route Module

Create `web/src/routes/my-new-page.js`:

```javascript
export function render() {
  return `
    <div class="my-new-page">
      <h1>My New Page</h1>
      <p>Content here</p>
      <button id="action-btn">Do Something</button>
    </div>
  `
}

export function init() {
  const btn = document.getElementById('action-btn')
  btn.addEventListener('click', async () => {
    const res = await fetch('/api/my-endpoint')
    const data = await res.json()
    console.log(data)
  })
}

export function cleanup() {
  // Clean up if needed
}
```

### Step 2: Register Route

Edit `web/src/router.js`:

```javascript
// Add import at top
import * as myNewPage from './routes/my-new-page.js'

// Add route handler in route() function
if (normalized === '/my-new-page') {
  app.innerHTML = myNewPage.render()
  if (myNewPage.init) await myNewPage.init()
  currentCleanup = myNewPage.cleanup
  return
}
```

### Step 3: Add to Menu (Optional)

Edit `web/src/main-menu.js`:

```javascript
{
  layer: 'Layer 1 (Business)',
  short: '1. Business',
  roles: [],
  items: [
    { label: 'Canvas Assembly', path: '/canvas-assembly' },
    { label: 'My New Page', path: '/my-new-page' },  // Add here
    { label: 'Bridges', path: '/bridges' }
  ]
}
```

### Step 4: Rebuild

```bash
pnpm run build
```

That's it! Navigate to `/my-new-page` and your page loads.

## Benefits of SPA Architecture

### Performance
- **Faster navigation**: No full page reloads, only content updates
- **Reduced bandwidth**: Only JSON data transferred after initial load
- **Better caching**: Static assets (JS/CSS) cached separately from data

### User Experience
- **Instant transitions**: Smooth, app-like feel
- **Persistent state**: Client-side state survives navigation
- **No flash**: No blank screen between pages

### Development
- **Modular**: Each page is a self-contained module
- **Testable**: Routes can be unit tested independently
- **Type-safe**: Can add TypeScript without changing architecture

## Trade-offs

### Challenges
- **Initial load**: Larger JavaScript bundle (79KB for BridgeFlow)
- **SEO**: Search engines may have trouble indexing (not a concern for BridgeFlow admin app)
- **JavaScript required**: App won't work without JS (acceptable for internal tools)
- **State management**: Need to manage client-side state carefully

### When NOT to Use SPA
- Public marketing sites (SEO critical)
- Simple content sites (unnecessary complexity)
- Large legacy codebases (migration cost)

### Why SPA Works for BridgeFlow
- ✅ Internal admin tool (SEO not needed)
- ✅ Authenticated users only (JavaScript always available)
- ✅ Complex interactions (drag-and-drop, real-time updates)
- ✅ Fast navigation between many pages
- ✅ Clean architecture for scaling

## Authentication in SPA

BridgeFlow uses session-based auth:

1. Login happens on standalone `login.html`
2. After login, session cookie is set
3. SPA requests include session cookie automatically
4. Router checks `/api/auth/me` on mount
5. If unauthenticated, redirects to `/login.html`

Routes that need auth check in their `init()`:

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

## API Communication

All API calls use `fetch()` with JSON:

```javascript
// In any route module
export async function init() {
  try {
    const res = await fetch('/api/bridges')
    if (!res.ok) throw new Error('Failed to fetch bridges')
    const bridges = await res.json()
    
    // Update UI with data
    document.getElementById('bridge-list').innerHTML = bridges
      .map(b => `<li>${b.name}</li>`)
      .join('')
  } catch (err) {
    console.error('Error loading bridges:', err)
  }
}
```

## Debugging Tips

### View Current Route
```javascript
console.log(window.location.pathname)
```

### Trigger Route Manually
```javascript
window.router.route('/canvas-assembly')
```

### Inspect App Container
```javascript
console.log(document.getElementById('app').innerHTML)
```

### Check Route Registration
View `web/src/router.js` and search for your path.

## Migration Notes

**Before SPA (Multi-Page):**
- 14 separate HTML files in `web/`
- Each with full HTML structure and scripts
- Fastify served static files
- Links caused full page reloads

**After SPA (Current):**
- 1 HTML file: `index.html`
- Route modules in `web/src/routes/`
- Fastify fallback serves `index.html` for all routes
- Links intercepted by router, no reloads

**Deleted Files:**
- `web/canvas-assembly.html`
- `web/infrastructure.html`
- `web/admin/users.html`
- ... (all page HTML files)

**Kept:**
- `web/index.html` (SPA entry)
- `web/login.html` (standalone, not part of SPA)

## Further Reading

- [MDN: Working with the History API](https://developer.mozilla.org/en-US/docs/Web/API/History_API)
- [JavaScript Info: Fetch API](https://javascript.info/fetch)
- See also: `docs/development.md` for build/dev workflow
