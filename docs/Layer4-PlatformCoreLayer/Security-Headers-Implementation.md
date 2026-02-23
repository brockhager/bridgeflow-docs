# Security Headers Implementation

## Overview
This document describes the implementation of HTTP security headers and Content Security Policy (CSP) as part of Security Hardening Phase A.

## Implementation Details

### Plugin Architecture
- **File**: [api/lib/securityHeaders.js](../../api/lib/securityHeaders.js)
- **Type**: Fastify plugin using `fastify-plugin` wrapper
- **Hook**: Uses `onSend` hook to inject headers into all responses
- **Integration**: Registered in [api/server.js](../../api/server.js) after cookies, before rate limiting

### Security Headers

#### Strict-Transport-Security (HSTS)
- **Purpose**: Force HTTPS connections and prevent SSL stripping attacks
- **Default**: Enabled in production only (disabled in development to avoid localhost certificate issues)
- **Configuration**:
  - `DISABLE_HSTS=true` — disable HSTS entirely
  - `HSTS_MAX_AGE=31536000` — max-age in seconds (default: 1 year)
  - `HSTS_INCLUDE_SUBDOMAINS=true` — include subdomains (default: true)
  - `HSTS_IN_DEV=true` — enable HSTS in development (default: false)
- **Value**: `max-age=31536000; includeSubDomains`

#### X-Frame-Options
- **Purpose**: Prevent clickjacking attacks by controlling iframe embedding
- **Default**: `DENY` (cannot be embedded in any iframe)
- **Configuration**: `X_FRAME_OPTIONS=DENY|SAMEORIGIN|ALLOW-FROM`
- **Value**: `DENY`

#### X-Content-Type-Options
- **Purpose**: Prevent MIME-sniffing attacks
- **Default**: `nosniff` (always enabled)
- **Value**: `nosniff`

#### Referrer-Policy
- **Purpose**: Control how much referrer information is sent with requests
- **Default**: `strict-origin-when-cross-origin` (full URL for same-origin, origin only for HTTPS cross-origin)
- **Configuration**: `REFERRER_POLICY=no-referrer|strict-origin-when-cross-origin|...`
- **Value**: `strict-origin-when-cross-origin`

#### Permissions-Policy
- **Purpose**: Restrict browser features (camera, microphone, geolocation, etc.)
- **Default**: All sensitive features disabled
- **Value**: `camera=(), microphone=(), geolocation=(), payment=(), usb=(), interest-cohort=()`
- **Note**: `interest-cohort=()` blocks Google FLoC tracking

#### X-XSS-Protection
- **Purpose**: Legacy XSS filter for older browsers (modern browsers rely on CSP)
- **Default**: `1; mode=block` (enable XSS filter and block page if attack detected)
- **Value**: `1; mode=block`

### Content Security Policy (CSP)

#### Default Policy
```
default-src 'self';
script-src 'self';
style-src 'self' 'unsafe-inline';
img-src 'self' data: https:;
connect-src 'self';
font-src 'self';
object-src 'none';
frame-ancestors 'none';
upgrade-insecure-requests
```

#### Policy Breakdown
- **default-src 'self'**: Only load resources from same origin (baseline restriction)
- **script-src 'self'**: Only execute scripts from same origin (prevents XSS)
- **style-src 'self' 'unsafe-inline'**: Styles from same origin + inline styles (legacy compatibility)
- **img-src 'self' data: https:**: Images from same origin, data URIs, and any HTTPS source
- **connect-src 'self'**: API calls (fetch, XHR) only to same origin
- **font-src 'self'**: Web fonts from same origin only
- **object-src 'none'**: Block all plugins (Flash, Java, etc.)
- **frame-ancestors 'none'**: Prevent embedding in iframes (equivalent to X-Frame-Options: DENY)
- **upgrade-insecure-requests**: Automatically upgrade HTTP to HTTPS

#### Environment Behavior
- **Development**: CSP in **report-only** mode by default (logs violations to console without blocking)
  - Override with `CSP_ENFORCE=true` to enforce CSP in development
- **Production**: CSP in **enforce** mode (blocks violations)
  - Override with `CSP_REPORT_ONLY=true` for report-only mode in production
- **Disable**: Set `DISABLE_CSP=true` to disable CSP entirely (not recommended)

#### Environment Variables
- `DISABLE_CSP=true` — disable CSP entirely
- `CSP_REPORT_ONLY=true` — force report-only mode (even in production)
- `CSP_ENFORCE=true` — force enforce mode (even in development)

### Configuration

#### Server Integration
```javascript
// api/server.js
import securityHeaders from './lib/securityHeaders.js'

app.register(securityHeaders, {
  // HSTS configuration
  hsts: process.env.DISABLE_HSTS !== 'true',
  hstsMaxAge: parseInt(process.env.HSTS_MAX_AGE || '31536000', 10),
  hstsIncludeSubDomains: process.env.HSTS_INCLUDE_SUBDOMAINS !== 'false',
  hstsInDev: process.env.HSTS_IN_DEV === 'true',
  
  // CSP configuration
  csp: process.env.DISABLE_CSP !== 'true',
  cspReportOnly: process.env.CSP_REPORT_ONLY === 'true' || 
                 (process.env.NODE_ENV === 'development' && process.env.CSP_ENFORCE !== 'true'),
  
  // Other headers
  xFrameOptions: process.env.X_FRAME_OPTIONS || 'DENY',
  referrerPolicy: process.env.REFERRER_POLICY || 'strict-origin-when-cross-origin',
  
  // Skip headers for specific routes if needed
  skipRoutes: []
})
```

#### Plugin Options
- `hsts` (boolean): Enable/disable HSTS
- `hstsMaxAge` (number): HSTS max-age in seconds
- `hstsIncludeSubDomains` (boolean): Include subdomains in HSTS
- `hstsPreload` (boolean): Add preload directive (for HSTS preload list)
- `hstsInDev` (boolean): Enable HSTS in development
- `csp` (boolean|object): Enable CSP or provide custom CSP object
- `cspReportOnly` (boolean): CSP report-only mode
- `xFrameOptions` (string): X-Frame-Options value
- `xContentTypeOptions` (boolean): Enable/disable X-Content-Type-Options
- `referrerPolicy` (string): Referrer-Policy value
- `permissionsPolicy` (object): Custom Permissions-Policy
- `skipRoutes` (array): Array of URL patterns to skip (for health checks, etc.)

### Testing

#### Test Coverage
- **File**: [api/tests/securityHeaders.test.js](../../api/tests/securityHeaders.test.js)
- **Total Tests**: 16
- **Test Categories**:
  1. Basic Headers (X-Frame-Options, X-Content-Type-Options, Referrer-Policy, Permissions-Policy, X-XSS-Protection)
  2. CSP Modes (report-only in dev, enforce in production)
  3. CSP Directives (default-src, script-src, frame-ancestors, upgrade-insecure-requests)
  4. HSTS Behavior (disabled in dev, enabled in production with correct directives)
  5. Environment Variable Overrides (DISABLE_CSP, DISABLE_HSTS, X_FRAME_OPTIONS)

#### Running Tests
```powershell
# Run security headers tests only
pnpm test api/tests/securityHeaders.test.js

# Run all tests
pnpm test
```

### Security Scanner Compliance

#### OWASP Recommendations
✅ Strict-Transport-Security (HSTS)  
✅ X-Frame-Options (clickjacking protection)  
✅ X-Content-Type-Options (MIME-sniffing protection)  
✅ Referrer-Policy (referrer leakage prevention)  
✅ Permissions-Policy (feature restriction)  
✅ Content-Security-Policy (XSS prevention)  
✅ X-XSS-Protection (legacy browser support)  

#### Expected Scanner Score
- **securityheaders.com**: A+ (all recommended headers present)
- **Mozilla Observatory**: A+ (comprehensive header coverage)

### Development Workflow

#### Local Development
By default, security headers work seamlessly in development:
- HSTS is disabled (no certificate warnings on localhost)
- CSP is in report-only mode (violations logged to console, not blocked)
- All other headers are active for realistic testing

#### Testing Security Headers Locally
```powershell
# Start server
pnpm dev

# Check headers with curl
curl -I http://localhost:3000/

# Expected headers in development:
# X-Frame-Options: DENY
# X-Content-Type-Options: nosniff
# Referrer-Policy: strict-origin-when-cross-origin
# Permissions-Policy: camera=(), microphone=(), ...
# Content-Security-Policy-Report-Only: default-src 'self'; ...
# (no Strict-Transport-Security in dev by default)
```

#### Production Testing
```powershell
# Set production environment
$env:NODE_ENV = 'production'
pnpm start

# Check headers
curl -I http://localhost:3000/

# Expected headers in production (HTTPS):
# Strict-Transport-Security: max-age=31536000; includeSubDomains
# X-Frame-Options: DENY
# X-Content-Type-Options: nosniff
# Referrer-Policy: strict-origin-when-cross-origin
# Permissions-Policy: camera=(), microphone=(), ...
# Content-Security-Policy: default-src 'self'; ...
```

### CSP Debugging

#### Console Output
When CSP is in report-only mode (development), violations are logged to the browser console:
```
[Report Only] Refused to load the script 'https://evil.com/script.js' because it violates 
the following Content Security Policy directive: "script-src 'self'".
```

#### Common Violations
1. **Inline Scripts**: `script-src 'self'` blocks `<script>alert('xss')</script>`
   - Solution: Move scripts to external files or add nonce/hash (Phase 2)
2. **External Resources**: `default-src 'self'` blocks third-party CDNs
   - Solution: Add specific origins to CSP (e.g., `script-src 'self' https://cdn.jsdelivr.net`)
3. **Inline Styles**: Currently allowed via `'unsafe-inline'` for compatibility
   - Solution: Remove `'unsafe-inline'` and use nonce/hash in production (Phase 2)

### Future Enhancements (Phase 2)

#### CSP Nonce Support ✅ IMPLEMENTED
- **Status**: Complete
- **Feature**: Generate unique cryptographic nonces per request for inline scripts/styles
- **Implementation**: 
  - `generateNonce()` function creates 16-byte base64-encoded nonces using `crypto.randomBytes()`
  - Nonces automatically injected into CSP `script-src` and `style-src` directives
  - Available via `request.cspNonce` in route handlers
  - Enabled with `CSP_USE_NONCES=true` environment variable
- **Benefits**: Allows safe inline scripts/styles without `'unsafe-inline'` in production

#### CSP Violation Reporting ✅ IMPLEMENTED
- **Status**: Complete
- **Endpoint**: `POST /api/csp-report`
- **Features**:
  - Rate-limited to 100 reports per minute to prevent DoS
  - Sanitizes reports (truncates long values, filters unexpected fields)
  - Integrates with audit logging system (`csp.violation` events)
  - Determines severity (critical vs warning) based on violated directive
  - Logs violations to console in development mode
- **Audit Integration**: All violations logged with `event: 'csp.violation'`, actor, severity, metadata
- **Future**: Add alerting for critical violations in production (currently stubbed)

#### Production CSP Hardening ✅ IMPLEMENTED
- **Status**: Complete
- **Production CSP Policy** (`PRODUCTION_CSP`):
  - Removes all `'unsafe-inline'` and `'unsafe-eval'` directives
  - Adds granular directives: `script-src-elem`, `script-src-attr`, `style-src-elem`, `style-src-attr`
  - Adds `base-uri 'self'` to prevent base tag injection
  - Adds `form-action 'self'` to prevent form hijacking
  - Automatically used when `NODE_ENV=production` (override with `USE_PRODUCTION_CSP=false`)
- **Benefits**: Maximum protection against XSS, clickjacking, and code injection attacks

#### Per-Page/Route CSP ✅ IMPLEMENTED
- **Status**: Complete
- **Implementation**:
  - `getRouteCspPolicy()` function determines policy based on request URL
  - Built-in policies for `/admin` routes (more restrictive)
  - Custom policies via `routeCspPolicies` configuration option
  - Supports both string patterns and RegExp matching
- **Example Admin Policy**:
  ```javascript
  admin: {
    'default-src': ["'self'"],
    'script-src': ["'self'"],  // No external scripts
    'style-src': ["'self'"],    // No external styles
    'img-src': ["'self'", 'data:'],  // No external images
    'connect-src': ["'self'"],  // API calls only to same origin
    'object-src': ["'none'"],
    'frame-ancestors': ["'none'"]
  }
  ```
- **Usage**: Automatically applied based on route, no code changes needed

### Environment Variables (Complete List)

#### HSTS Configuration
- `DISABLE_HSTS` — disable HSTS (default: false)
- `HSTS_MAX_AGE` — HSTS max-age in seconds (default: 31536000 = 1 year)
- `HSTS_INCLUDE_SUBDOMAINS` — include subdomains (default: true)
- `HSTS_IN_DEV` — enable HSTS in development (default: false)

#### CSP Configuration
- `DISABLE_CSP` — disable CSP entirely (default: false)
- `CSP_REPORT_ONLY` — CSP report-only mode (default: true in dev, false in prod)
- `CSP_ENFORCE` — enforce CSP in development (default: false)
- `CSP_USE_NONCES` — enable nonce generation for inline scripts/styles (default: false)
- `USE_PRODUCTION_CSP` — use hardened production CSP (default: true in production)
- `CSP_REPORT_URI` — CSP violation report endpoint (default: `/api/csp-report`)

#### Other Headers
- `X_FRAME_OPTIONS` — X-Frame-Options value (default: DENY)
- `REFERRER_POLICY` — Referrer-Policy value (default: strict-origin-when-cross-origin)

### Advanced Usage

#### Using Nonces in HTML Templates
```javascript
// In route handler
app.get('/secure-page', (request, reply) => {
  const nonce = request.cspNonce  // Available when CSP_USE_NONCES=true
  reply.send(`
    <!DOCTYPE html>
    <html>
      <head>
        <script nonce="${nonce}">
          // Inline script allowed with nonce
          console.log('This script is allowed by CSP');
        </script>
      </head>
      <body>
        <h1>Secure Page</h1>
      </body>
    </html>
  `)
})
```

#### Custom Route-Specific CSP
```javascript
// In server.js
app.register(securityHeaders, {
  // ... other config ...
  routeCspPolicies: {
    '/api/webhook': {
      'default-src': ["'self'"],
      'connect-src': ["'self'", 'https://external-api.com'],  // Allow external API
      'script-src': ["'none'"]  // No scripts on webhook endpoint
    },
    // RegExp patterns also supported
    /^\/public\//: {
      'script-src': ["'self'", 'https://cdn.jsdelivr.net'],
      'style-src': ["'self'", 'https://cdn.jsdelivr.net']
    }
  }
})
```

#### CSP Violation Monitoring
```javascript
// Violations are automatically logged to audit system
// Query violations:
const violations = await prisma.auditLog.findMany({
  where: { event: 'csp.violation' },
  orderBy: { createdAt: 'desc' }
})

// Check for critical violations (script-src, script-src-elem, default-src)
const criticalViolations = violations.filter(v => 
  v.meta.severity === 'critical'
)
```

### Troubleshooting

#### Headers Not Applied
1. Check that security headers plugin is registered in server.js
2. Verify route is not in `skipRoutes` array
3. Check for conflicting plugins that might override headers

#### HSTS Issues in Development
- HSTS is disabled in development by default (no localhost certificate issues)
- If you need HSTS in dev, set `HSTS_IN_DEV=true`
- Clear browser HSTS cache if switching between dev/prod: `chrome://net-internals/#hsts`

#### CSP Blocking Resources
1. Check browser console for CSP violations
2. If in production, temporarily enable report-only mode: `CSP_REPORT_ONLY=true`
3. Update CSP policy to allow required resources
4. Test with `CSP_ENFORCE=true` in development before deploying

### References
- [OWASP Secure Headers Project](https://owasp.org/www-project-secure-headers/)
- [MDN Content Security Policy](https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP)
- [MDN HTTP Strict Transport Security](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Strict-Transport-Security)
- [Security Headers Scanner](https://securityheaders.com/)
- [Mozilla Observatory](https://observatory.mozilla.org/)

