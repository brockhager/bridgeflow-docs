/**
 * Bridge Form - Handle template parameters and form submission
 */

// Partner templates (same as in canvas-visual.js)
const PARTNER_TEMPLATES = {
  shopify: { name: "Shopify", icon: "🛒", defaultAuth: "api_key" },
  stripe: { name: "Stripe", icon: "💳", defaultAuth: "bearer" },
  quickbooks: { name: "QuickBooks", icon: "📊", defaultAuth: "oauth2" },
  salesforce: { name: "Salesforce", icon: "☁️", defaultAuth: "oauth2" },
  mailchimp: { name: "Mailchimp", icon: "📧", defaultAuth: "api_key" },
  slack: { name: "Slack", icon: "💬", defaultAuth: "bearer" },
  hubspot: { name: "HubSpot", icon: "🎯", defaultAuth: "oauth2" },
  woocommerce: { name: "WooCommerce", icon: "🛍️", defaultAuth: "api_key" }
};

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
  initializeForm();
  setupFormHandlers();
});

/**
 * Initialize form with URL parameters
 */
function initializeForm() {
  const urlParams = new URLSearchParams(window.location.search);
  const templateKey = urlParams.get('template');

  // If template parameter exists, pre-fill the form
  if (templateKey && PARTNER_TEMPLATES[templateKey]) {
    const template = PARTNER_TEMPLATES[templateKey];

    // Show template badge
    showTemplateBadge(template);

    // Pre-fill form fields
    const name = urlParams.get('name') || `${template.name} Bridge`;
    const type = urlParams.get('type') || 'api';
    const direction = urlParams.get('direction') || 'inbound';
    const authMethod = urlParams.get('authMethod') || template.defaultAuth;

    document.getElementById('name').value = name;
    document.getElementById('type').value = type;
    document.getElementById('direction').value = direction;
    document.getElementById('authMethod').value = authMethod;

    // Trigger auth method change to show relevant fields
    document.getElementById('authMethod').dispatchEvent(new Event('change'));
  }

  // Check if editing existing bridge
  const bridgeId = urlParams.get('id');
  if (bridgeId) {
    loadExistingBridge(bridgeId);
  }
}

/**
 * Show template badge
 */
function showTemplateBadge(template) {
  const badge = document.getElementById('templateBadge');
  badge.innerHTML = `
    <span style="font-size: 24px;">${template.icon}</span>
    <span><strong>${template.name}</strong> Template</span>
  `;
  badge.style.display = 'inline-flex';
}

/**
 * Setup form event handlers
 */
function setupFormHandlers() {
  const form = document.getElementById('bridgeForm');
  const authMethodSelect = document.getElementById('authMethod');

  // Handle auth method changes
  authMethodSelect.addEventListener('change', (e) => {
    updateAuthFields(e.target.value);
  });

  // Handle form submission
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    await handleFormSubmit();
  });

  // Initial auth fields setup
  updateAuthFields(authMethodSelect.value);
}

/**
 * Update authentication fields based on selected method
 */
function updateAuthFields(method) {
  const container = document.getElementById('authFields');

  const fields = {
    none: '',
    api_key: `
      <div class="auth-fields">
        <div class="form-group">
          <label for="apiKey">API Key *</label>
          <input type="password" id="apiKey" name="apiKey" required placeholder="Enter your API key">
        </div>
        <div class="form-group">
          <label for="apiKeyHeader">Header Name</label>
          <input type="text" id="apiKeyHeader" name="apiKeyHeader" value="X-API-Key" placeholder="X-API-Key">
          <div class="help-text">The header name for the API key (default: X-API-Key)</div>
        </div>
      </div>
    `,
    bearer: `
      <div class="auth-fields">
        <div class="form-group">
          <label for="bearerToken">Bearer Token *</label>
          <input type="password" id="bearerToken" name="bearerToken" required placeholder="Enter bearer token">
        </div>
      </div>
    `,
    basic: `
      <div class="auth-fields">
        <div class="form-group">
          <label for="username">Username *</label>
          <input type="text" id="username" name="username" required placeholder="Username">
        </div>
        <div class="form-group">
          <label for="password">Password *</label>
          <input type="password" id="password" name="password" required placeholder="Password">
        </div>
      </div>
    `,
    oauth2: `
      <div class="auth-fields">
        <div class="form-group">
          <label for="clientId">Client ID *</label>
          <input type="text" id="clientId" name="clientId" required placeholder="OAuth Client ID">
        </div>
        <div class="form-group">
          <label for="clientSecret">Client Secret *</label>
          <input type="password" id="clientSecret" name="clientSecret" required placeholder="OAuth Client Secret">
        </div>
        <div class="form-group">
          <label for="authUrl">Authorization URL</label>
          <input type="url" id="authUrl" name="authUrl" placeholder="https://oauth.provider.com/authorize">
        </div>
        <div class="form-group">
          <label for="tokenUrl">Token URL</label>
          <input type="url" id="tokenUrl" name="tokenUrl" placeholder="https://oauth.provider.com/token">
        </div>
      </div>
    `
  };

  container.innerHTML = fields[method] || '';
}

/**
 * Handle form submission
 */
async function handleFormSubmit() {
  const formData = new FormData(document.getElementById('bridgeForm'));
  const bridgeData = Object.fromEntries(formData.entries());

  // Add metadata
  bridgeData.id = 'bridge-' + Date.now();
  bridgeData.status = 'inactive';
  bridgeData.transactionCount = 0;
  bridgeData.successCount = 0;
  bridgeData.createdAt = new Date().toISOString();

  console.log('Creating bridge:', bridgeData);

  try {
    // In a real app, this would be an API call
    // For now, we'll save to localStorage
    await saveBridge(bridgeData);

    // Show success message
    alert('✅ Bridge created successfully!');

    // Redirect to canvas
    window.location.href = '/canvas-visual.html';
  } catch (error) {
    console.error('Error creating bridge:', error);
    alert('❌ Failed to create bridge. Please try again.');
  }
}

/**
 * Save bridge to localStorage (simulating API)
 */
async function saveBridge(bridgeData) {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500));

  // Get existing bridges
  const stored = localStorage.getItem('bridgeflow_bridges');
  const data = stored ? JSON.parse(stored) : { bridges: [] };

  // Add new bridge
  data.bridges.push(bridgeData);

  // Save back to localStorage
  localStorage.setItem('bridgeflow_bridges', JSON.stringify(data));
}

/**
 * Load existing bridge for editing
 */
async function loadExistingBridge(bridgeId) {
  // Simulate API call
  await new Promise(resolve => setTimeout(resolve, 300));

  const stored = localStorage.getItem('bridgeflow_bridges');
  if (!stored) return;

  const data = JSON.parse(stored);
  const bridge = data.bridges.find(b => b.id === bridgeId);

  if (bridge) {
    // Update form title
    document.querySelector('h1').textContent = 'Edit Bridge';

    // Populate form
    document.getElementById('name').value = bridge.name || '';
    document.getElementById('type').value = bridge.type || 'api';
    document.getElementById('direction').value = bridge.direction || 'inbound';
    document.getElementById('sourceUrl').value = bridge.sourceUrl || '';
    document.getElementById('targetUrl').value = bridge.targetUrl || '';
    document.getElementById('authMethod').value = bridge.authMethod || 'none';
    document.getElementById('description').value = bridge.description || '';

    // Trigger auth fields update
    document.getElementById('authMethod').dispatchEvent(new Event('change'));

    // Update submit button
    const submitBtn = document.querySelector('button[type="submit"]');
    submitBtn.textContent = 'Update Bridge';
  }
}

console.log('Bridge Form: Ready!');
