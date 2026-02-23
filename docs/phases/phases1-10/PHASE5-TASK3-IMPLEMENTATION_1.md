# Phase 5 Task 3: Onboarding Flow Implementation Guide

## Overview
This guide provides the complete implementation for the welcome/onboarding screen in BridgeFlow. The onboarding flow helps new users understand the platform and guides them through their first steps.

## What's Included

### 1. Welcome Screen (`web/welcome.html`)
A comprehensive onboarding page that includes:
- **User Profile Display**: Shows user's name, email, and initials in a gradient avatar
- **3-Step Getting Started Guide**: 
  - Step 1: Create Your First Bridge
  - Step 2: Test Your Connection
  - Step 3: Monitor Activity
- **Feature Highlights**: Showcases key BridgeFlow capabilities
- **Quick Navigation Links**: Easy access to all main pages
- **Continue to Dashboard**: Primary CTA to proceed

### 2. Welcome Page Logic (`web/src/welcome.js`)
JavaScript that handles:
- Fetching user information from `/api/auth/me`
- Displaying user's name and email
- Generating user initials for avatar
- Authentication redirect (if not logged in)
- Optional analytics tracking for step clicks

### 3. Updated Registration Flow (`web/src/register.js`)
Modified to redirect new users to the welcome page instead of directly to the dashboard.

## File Changes Required

### File 1: Create `web/welcome.html`
```html
<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1" />
  <title>Welcome to BridgeFlow</title>
  <link rel="stylesheet" href="/styles.css" />
</head>
<body>
  <main class="canvas-app" role="main">
    <!-- Welcome Header -->
    <div class="canvas-header">
      <h1>🎉 Welcome to BridgeFlow!</h1>
      <p class="muted">Let's get you started with your first integration</p>
    </div>

    <!-- User Info Section -->
    <div style="max-width: 900px; margin: 0 auto 48px;">
      <div class="app" style="padding: 24px; text-align: center;">
        <div style="margin-bottom: 16px;">
          <div style="width: 80px; height: 80px; border-radius: 50%; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); margin: 0 auto 16px; display: flex; align-items: center; justify-content: center; font-size: 36px; color: white; font-weight: 600;">
            <span id="userInitials">?</span>
          </div>
          <h2 style="margin: 0 0 4px 0; font-size: 24px;" id="userName">Loading...</h2>
          <p style="margin: 0; color: var(--muted);" id="userEmail">Loading...</p>
        </div>
      </div>
    </div>

    <!-- Onboarding Steps -->
    <div style="max-width: 900px; margin: 0 auto;">
      <h2 style="font-size: 24px; margin: 0 0 24px 0; text-align: center;">Get Started in 3 Easy Steps</h2>
      
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 24px; margin-bottom: 48px;">
        <!-- Step 1: Create Your First Bridge -->
        <div class="workflow-card">
          <div class="workflow-card-icon">🌉</div>
          <div class="workflow-card-content">
            <h3>1. Create Your First Bridge</h3>
            <p>Connect BridgeFlow to your external APIs. Bridges are the foundation of your integrations.</p>
          </div>
          <div class="workflow-card-footer">
            <span class="workflow-status ready">Step 1</span>
            <a href="./bridge-form.html" class="btn primary" style="text-decoration: none;">
              Create Bridge
            </a>
          </div>
        </div>

        <!-- Step 2: Test Your Connection -->
        <div class="workflow-card">
          <div class="workflow-card-icon">🔌</div>
          <div class="workflow-card-content">
            <h3>2. Test Your Connection</h3>
            <p>Use our webhook tester to send test data and verify your bridge is working correctly.</p>
          </div>
          <div class="workflow-card-footer">
            <span class="workflow-status ready">Step 2</span>
            <a href="./webhook-tester.html" class="btn primary" style="text-decoration: none;">
              Test Webhook
            </a>
          </div>
        </div>

        <!-- Step 3: Monitor Activity -->
        <div class="workflow-card">
          <div class="workflow-card-icon">📊</div>
          <div class="workflow-card-content">
            <h3>3. Monitor Activity</h3>
            <p>View real-time transaction logs and see exactly what data flows through your integrations.</p>
          </div>
          <div class="workflow-card-footer">
            <span class="workflow-status ready">Step 3</span>
            <a href="./transactions.html" class="btn primary" style="text-decoration: none;">
              View Transactions
            </a>
          </div>
        </div>
      </div>

      <!-- What You Can Do Section -->
      <div class="app" style="padding: 32px; margin-bottom: 48px;">
        <h2 style="font-size: 20px; margin: 0 0 24px 0; text-align: center;">What You Can Do with BridgeFlow</h2>
        
        <div style="display: grid; gap: 16px;">
          <div style="display: flex; gap: 16px; align-items: start;">
            <div style="font-size: 32px; line-height: 1;">📧</div>
            <div>
              <h4 style="margin: 0 0 4px 0; font-size: 16px;">Invoice Automation</h4>
              <p style="margin: 0; font-size: 14px; color: var(--muted);">
                Send invoices via email automatically with our simple 5-minute wizard.
              </p>
            </div>
          </div>

          <div style="display: flex; gap: 16px; align-items: start;">
            <div style="font-size: 32px; line-height: 1;">🔄</div>
            <div>
              <h4 style="margin: 0 0 4px 0; font-size: 16px;">API Integration</h4>
              <p style="margin: 0; font-size: 14px; color: var(--muted);">
                Connect to any API with support for multiple authentication methods (API Key, Bearer, OAuth2).
              </p>
            </div>
          </div>

          <div style="display: flex; gap: 16px; align-items: start;">
            <div style="font-size: 32px; line-height: 1;">⚙️</div>
            <div>
              <h4 style="margin: 0 0 4px 0; font-size: 16px;">Data Transformation</h4>
              <p style="margin: 0; font-size: 14px; color: var(--muted);">
                Automatically transform data between different formats as it flows through your bridges.
              </p>
            </div>
          </div>

          <div style="display: flex; gap: 16px; align-items: start;">
            <div style="font-size: 32px; line-height: 1;">🎯</div>
            <div>
              <h4 style="margin: 0 0 4px 0; font-size: 16px;">Webhook Processing</h4>
              <p style="margin: 0; font-size: 14px; color: var(--muted);">
                Receive webhooks from external systems and automatically forward them to your APIs.
              </p>
            </div>
          </div>
        </div>
      </div>

      <!-- Quick Links -->
      <div style="text-align: center; margin-bottom: 32px;">
        <h3 style="font-size: 18px; margin: 0 0 16px 0;">Quick Links</h3>
        <div style="display: flex; gap: 12px; justify-content: center; flex-wrap: wrap;">
          <a href="./canvas.html" class="btn" style="text-decoration: none;">
            🏠 Dashboard
          </a>
          <a href="./bridges.html" class="btn" style="text-decoration: none;">
            🌉 Manage Bridges
          </a>
          <a href="./history.html" class="btn" style="text-decoration: none;">
            📜 Invoice History
          </a>
          <a href="./transactions.html" class="btn" style="text-decoration: none;">
            📊 Transactions
          </a>
        </div>
      </div>

      <!-- Continue to Dashboard -->
      <div style="text-align: center; padding: 32px 0;">
        <a href="./canvas.html" class="btn primary" style="text-decoration: none; padding: 16px 48px; font-size: 18px;">
          Continue to Dashboard →
        </a>
        <p style="margin: 16px 0 0 0; font-size: 14px; color: var(--muted);">
          You can always access this guide from your account settings
        </p>
      </div>
    </div>
  </main>
  <script type="module" src="./src/welcome.js"></script>
</body>
</html>
```

### File 2: Create `web/src/welcome.js`
```javascript
/**
 * Welcome/Onboarding page logic
 * Load and display user information after successful registration
 */

// Get API base URL
const API_BASE = window.location.port === '5173'
  ? 'http://localhost:4000/api'
  : '/api'

// Load user information
async function loadUserInfo() {
  try {
    const response = await fetch(`${API_BASE}/auth/me`, {
      credentials: 'include'
    })

    if (!response.ok) {
      // Not logged in, redirect to login
      window.location.href = '/login'
      return
    }

    const data = await response.json()
    const user = data.user

    // Update user name
    const userNameEl = document.getElementById('userName')
    if (user.name) {
      userNameEl.textContent = `Hello, ${user.name}!`
    } else {
      userNameEl.textContent = 'Hello!'
    }

    // Update user email
    const userEmailEl = document.getElementById('userEmail')
    userEmailEl.textContent = user.email

    // Update user initials
    const initialsEl = document.getElementById('userInitials')
    if (user.name) {
      const names = user.name.split(' ')
      if (names.length >= 2) {
        initialsEl.textContent = names[0][0].toUpperCase() + names[names.length - 1][0].toUpperCase()
      } else {
        initialsEl.textContent = names[0][0].toUpperCase()
      }
    } else {
      // Use first letter of email as fallback
      initialsEl.textContent = user.email[0].toUpperCase()
    }

  } catch (error) {
    console.error('Failed to load user info:', error)
    // Redirect to login on error
    window.location.href = '/login'
  }
}

// Load user info on page load
loadUserInfo()

// Optional: Track if user completes each step (for future analytics)
// For now, just log clicks on action buttons
const actionButtons = document.querySelectorAll('.workflow-card a.btn')
actionButtons.forEach((button, index) => {
  button.addEventListener('click', () => {
    console.log(`User clicked on step ${index + 1}:`, button.textContent.trim())
    // In production, you might want to track this with analytics
  })
})
```

### File 3: Update `web/src/register.js`
Change line 65 from:
```javascript
window.location.href = './canvas.html'
```

To:
```javascript
window.location.href = './welcome.html'
```

Full updated file:
```javascript
/**
 * Register page logic
 */

const form = document.getElementById('registerForm')
const errorDiv = document.getElementById('errorMessage')

// Get API base URL
const API_BASE = window.location.port === '5173'
  ? 'http://localhost:4000/api'
  : '/api'

form.addEventListener('submit', async (e) => {
  e.preventDefault()

  const name = document.getElementById('name').value.trim()
  const email = document.getElementById('email').value.trim()
  const password = document.getElementById('password').value

  // Clear previous errors
  hideError()

  // Validate password
  if (password.length < 8) {
    showError('Password must be at least 8 characters long')
    return
  }

  // Show loading state
  const submitButton = form.querySelector('button[type="submit"]')
  const originalText = submitButton.textContent
  submitButton.textContent = 'Creating account...'
  submitButton.disabled = true

  try {
    const response = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      credentials: 'include', // Include cookies
      body: JSON.stringify({
        name: name || undefined,
        email,
        password
      })
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.message || data.error || 'Registration failed')
    }

    // Store token in localStorage as backup
    if (data.token) {
      localStorage.setItem('token', data.token)
      localStorage.setItem('user', JSON.stringify(data.user))
    }

    // Show success and redirect
    showNotification('Account created successfully! Redirecting...', 'success')

    // Redirect to welcome page after a brief delay
    setTimeout(() => {
      window.location.href = './welcome.html'
    }, 1000)

  } catch (error) {
    console.error('Registration error:', error)
    showError(error.message)

    // Reset button
    submitButton.textContent = originalText
    submitButton.disabled = false
  }
})

function showError(message) {
  errorDiv.textContent = '❌ ' + message
  errorDiv.style.display = 'block'
}

function hideError() {
  errorDiv.style.display = 'none'
}

function showNotification(message, type = 'info') {
  const notification = document.createElement('div')
  notification.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    padding: 16px 20px;
    background: ${type === 'error' ? '#ef4444' : type === 'success' ? '#10b981' : '#3b82f6'};
    color: white;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    z-index: 2000;
    font-size: 14px;
    font-weight: 500;
    max-width: 400px;
  `
  notification.textContent = message
  document.body.appendChild(notification)

  setTimeout(() => {
    notification.remove()
  }, 4000)
}
```

## Implementation Steps

1. **Add welcome.html**
   - Navigate to your `web` folder
   - Create `welcome.html` with the content above

2. **Add welcome.js**
   - Navigate to your `web/src` folder
   - Create `welcome.js` with the content above

3. **Update register.js**
   - Open `web/src/register.js`
   - Change the redirect from `canvas.html` to `welcome.html` (line 65)

4. **Test the Flow**
   ```bash
   # Start your server
   pnpm run api:start
   
   # In browser:
   # 1. Go to http://localhost:4000/register.html
   # 2. Register a new account
   # 3. Should redirect to http://localhost:4000/welcome.html
   # 4. Click "Continue to Dashboard" to go to canvas.html
   ```

## Features Implemented

### ✅ User Personalization
- Displays user's name and email
- Shows initials in a gradient avatar
- Fallback to email initial if no name provided

### ✅ Clear Onboarding Steps
- 3-step guide with clear CTAs
- Direct links to key features
- Visual workflow cards (reuses existing CSS)

### ✅ Feature Education
- Highlights 4 main BridgeFlow capabilities
- Icons and descriptions for each feature
- Helps users understand platform value

### ✅ Easy Navigation
- Quick links to all main pages
- Primary CTA to continue to dashboard
- Note about accessing guide later

### ✅ Authentication Protection
- Redirects to login if not authenticated
- Fetches user data from `/api/auth/me`
- Handles errors gracefully

## Design Consistency

The welcome screen uses existing BridgeFlow design patterns:
- **CSS Classes**: Reuses `.canvas-app`, `.workflow-card`, `.btn`, etc.
- **Color Scheme**: Matches existing accent colors and gradients
- **Responsive**: Works on mobile and desktop (existing CSS handles this)
- **Icons**: Uses emojis consistent with other pages

## Future Enhancements (Optional)

1. **Progress Tracking**: Store which steps user has completed
2. **Skip Option**: Allow users to skip onboarding
3. **Video Tutorial**: Embed a walkthrough video
4. **Interactive Tour**: Add tooltips or guided tour on dashboard
5. **Analytics**: Track onboarding completion rates
6. **Personalization**: Customize based on user's role or industry

## Testing Checklist

- [ ] New user registration redirects to welcome page
- [ ] Welcome page displays user name and email correctly
- [ ] Initials are calculated properly (first + last name)
- [ ] All navigation links work
- [ ] "Continue to Dashboard" goes to canvas.html
- [ ] Mobile responsive layout works
- [ ] Unauthenticated users are redirected to login
- [ ] Error handling works if API call fails

## Commit Message

```
Phase 5 Task 3: Add welcome/onboarding screen

- Created welcome.html with 3-step onboarding flow
- Created welcome.js to load and display user info
- Updated register.js to redirect to welcome page after signup
- Includes feature highlights and quick navigation links
- Reuses existing design system (CSS classes, colors, patterns)
- Responsive design works on mobile and desktop
```

## Notes

- No database changes required
- No API changes required
- Works with existing authentication system
- Can be deployed immediately after testing
- Users can always access canvas.html directly if they bookmark it

---

**Status**: Ready for implementation
**Estimated Time**: 10-15 minutes to implement and test
**Risk Level**: Low (no breaking changes, additive only)
