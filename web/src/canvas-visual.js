/**
 * Visual Canvas Builder - JavaScript Logic
 * Epic 6, Phase 1 MVP
 */

// ============================================
// PARTNER TEMPLATES
// ============================================

const PARTNER_TEMPLATES = {
  shopify: {
    name: "Shopify",
    icon: "🛒",
    color: "#96bf48",
    type: "inbound",
    description: "Receive orders from your Shopify store",
    defaultAuth: "api_key",
    category: "E-commerce"
  },
  stripe: {
    name: "Stripe",
    icon: "💳",
    color: "#635bff",
    type: "outbound",
    description: "Process payments through Stripe",
    defaultAuth: "bearer",
    category: "Payments"
  },
  quickbooks: {
    name: "QuickBooks",
    icon: "📊",
    color: "#2ca01c",
    type: "both",
    description: "Sync with QuickBooks accounting",
    defaultAuth: "oauth2",
    category: "Accounting"
  },
  salesforce: {
    name: "Salesforce",
    icon: "☁️",
    color: "#00a1e0",
    type: "both",
    description: "Sync CRM data with Salesforce",
    defaultAuth: "oauth2",
    category: "CRM"
  },
  mailchimp: {
    name: "Mailchimp",
    icon: "📧",
    color: "#ffe01b",
    type: "outbound",
    description: "Send marketing emails",
    defaultAuth: "api_key",
    category: "Marketing"
  },
  slack: {
    name: "Slack",
    icon: "💬",
    color: "#4a154b",
    type: "outbound",
    description: "Send notifications to Slack",
    defaultAuth: "bearer",
    category: "Communication"
  },
  hubspot: {
    name: "HubSpot",
    icon: "🎯",
    color: "#ff7a59",
    type: "both",
    description: "Sync with HubSpot CRM",
    defaultAuth: "oauth2",
    category: "CRM"
  },
  woocommerce: {
    name: "WooCommerce",
    icon: "🛍️",
    color: "#96588a",
    type: "inbound",
    description: "Receive WooCommerce orders",
    defaultAuth: "api_key",
    category: "E-commerce"
  }
};

// ============================================
// STATE MANAGEMENT
// ============================================

let bridges = [];
let autoRefreshInterval = null;

// ============================================
// INITIALIZATION
// ============================================

document.addEventListener('DOMContentLoaded', async () => {
  console.log('Canvas Visual: Initializing...');
  await loadBridges();

  // Auto-refresh every 30 seconds
  autoRefreshInterval = setInterval(async () => {
    await loadBridges(true); // Silent refresh
  }, 30000);

  // Keyboard shortcuts
  document.addEventListener('keydown', (e) => {
    // Escape to close modals
    if (e.key === 'Escape') {
      closeTemplates();
      closeBridgeDetail();
    }
    // Ctrl/Cmd + K to add bridge
    if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
      e.preventDefault();
      showTemplates();
    }
  });
});

// Cleanup on page unload
window.addEventListener('beforeunload', () => {
  if (autoRefreshInterval) {
    clearInterval(autoRefreshInterval);
  }
});

// ============================================
// API FUNCTIONS
// ============================================

/**
 * Load bridges from API
 * @param {boolean} silent - If true, don't show loading overlay
 */
async function loadBridges(silent = false) {
  try {
    if (!silent) {
      showLoading();
    }

    // In a real app, this would be an actual API call
    // For now, we'll simulate with mock data
    const response = await fetchBridgesFromAPI();

    if (response && response.bridges) {
      bridges = response.bridges;
    } else {
      bridges = [];
    }

    renderCanvas();

    if (!silent) {
      hideLoading();
    }
  } catch (error) {
    console.error('Error loading bridges:', error);
    hideLoading();
    showError('Failed to load bridges. Please try again.');
  }
}

/**
 * Simulate API call (replace with real API in production)
 */
async function fetchBridgesFromAPI() {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500));

  // Check if we have mock data in localStorage
  const mockData = localStorage.getItem('bridgeflow_bridges');
  if (mockData) {
    return JSON.parse(mockData);
  }

  // Return empty state for new users
  return { bridges: [] };
}

/**
 * Fetch bridge details by ID
 */
async function fetchBridgeDetails(bridgeId) {
  // Simulate API call
  await new Promise(resolve => setTimeout(resolve, 300));

  const bridge = bridges.find(b => b.id === bridgeId);
  if (!bridge) return null;

  // Simulate fetching recent activity
  return {
    ...bridge,
    recentActivity: generateMockActivity(bridge)
  };
}

/**
 * Generate mock activity for demonstration
 */
function generateMockActivity(bridge) {
  const activities = [
    { status: '✅', message: 'Transaction processed successfully', time: '2 minutes ago' },
    { status: '✅', message: 'Data synced with partner', time: '15 minutes ago' },
    { status: '⚠️', message: 'Retry attempt successful', time: '1 hour ago' },
    { status: '✅', message: 'Bridge health check passed', time: '2 hours ago' },
    { status: '✅', message: 'Connection established', time: '3 hours ago' }
  ];

  return activities.slice(0, 5);
}

// ============================================
// RENDERING FUNCTIONS
// ============================================

/**
 * Render the entire canvas
 */
function renderCanvas() {
  const bridgesContainer = document.getElementById('bridgesContainer');
  const emptyState = document.getElementById('emptyState');
  const addBridgeBtn = document.getElementById('addBridgeBtn');
  const companyStats = document.getElementById('companyStats');

  // Update company stats
  const activeBridges = bridges.filter(b => b.status === 'active').length;
  companyStats.innerHTML = `
    <div class="stat">
      <span class="stat-value">${bridges.length}</span>
      <span class="stat-label">Bridges</span>
    </div>
    <div class="stat">
      <span class="stat-value">${activeBridges}</span>
      <span class="stat-label">Active</span>
    </div>
  `;

  if (bridges.length === 0) {
    // Show empty state
    bridgesContainer.style.display = 'none';
    emptyState.style.display = 'block';
    addBridgeBtn.style.display = 'none';
  } else {
    // Show bridges
    emptyState.style.display = 'none';
    bridgesContainer.style.display = 'grid';
    addBridgeBtn.style.display = 'block';

    // Render bridge cards
    bridgesContainer.innerHTML = bridges.map(bridge => renderBridgeCard(bridge)).join('');
  }
}

/**
 * Render individual bridge card
 */
function renderBridgeCard(bridge) {
  const partner = guessPartner(bridge);
  const statusIcon = getStatusIcon(bridge.status);
  const directionIcon = getDirectionIcon(bridge.direction);
  const directionLabel = getDirectionLabel(bridge.direction);
  const successRate = calculateSuccessRate(bridge);
  const successClass = getSuccessRateClass(successRate);

  return `
    <div class="bridge-card direction-${bridge.direction}" onclick="showBridgeDetail('${bridge.id}')" role="button" tabindex="0" aria-label="View ${bridge.name} details">
      <div class="bridge-header">
        <h3 class="bridge-name">${bridge.name}</h3>
        <span class="bridge-status" aria-label="Status: ${bridge.status}">${statusIcon}</span>
      </div>

      <div class="bridge-direction direction-${bridge.direction}">
        <span class="direction-icon">${directionIcon}</span>
        <span>${directionLabel}</span>
      </div>

      <div class="bridge-partner">
        <div class="partner-icon" style="background: ${partner.color}15;">${partner.icon}</div>
        <div class="partner-info">
          <div class="partner-name">${partner.name}</div>
          <div class="partner-description">${partner.description}</div>
        </div>
      </div>

      <div class="bridge-stats">
        <div class="bridge-stat">
          <span class="bridge-stat-value">${bridge.transactionCount || 0}</span>
          <span class="bridge-stat-label">Transactions</span>
        </div>
        <div class="bridge-stat">
          <span class="bridge-stat-value success-rate ${successClass}">${successRate}%</span>
          <span class="bridge-stat-label">Success</span>
        </div>
      </div>
    </div>
  `;
}

// ============================================
// PARTNER MATCHING
// ============================================

/**
 * Guess partner from bridge name/URL
 */
function guessPartner(bridge) {
  const name = bridge.name.toLowerCase();
  const url = (bridge.sourceUrl || bridge.targetUrl || '').toLowerCase();

  // Try to match against known templates
  for (const [key, template] of Object.entries(PARTNER_TEMPLATES)) {
    if (name.includes(key) || url.includes(key)) {
      return template;
    }
  }

  // Default partner
  return {
    name: "Custom API",
    icon: "🔗",
    color: "#6B7280",
    description: "Custom integration"
  };
}

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Get status icon
 */
function getStatusIcon(status) {
  const icons = {
    active: '🟢',
    warning: '🟡',
    error: '🔴',
    inactive: '⚪',
    paused: '⏸️'
  };
  return icons[status] || '⚪';
}

/**
 * Get direction icon
 */
function getDirectionIcon(direction) {
  const icons = {
    inbound: '⬇️',
    outbound: '⬆️',
    both: '⬍⬍'
  };
  return icons[direction] || '⬍⬍';
}

/**
 * Get direction label
 */
function getDirectionLabel(direction) {
  const labels = {
    inbound: 'Receiving Data',
    outbound: 'Sending Data',
    both: 'Two-Way Sync'
  };
  return labels[direction] || 'Unknown';
}

/**
 * Calculate success rate
 */
function calculateSuccessRate(bridge) {
  if (!bridge.transactionCount || bridge.transactionCount === 0) {
    return 100;
  }

  const successCount = bridge.successCount || bridge.transactionCount;
  return Math.round((successCount / bridge.transactionCount) * 100);
}

/**
 * Get success rate CSS class
 */
function getSuccessRateClass(rate) {
  if (rate >= 95) return '';
  if (rate >= 80) return 'warning';
  return 'error';
}

// ============================================
// TEMPLATE PICKER MODAL
// ============================================

/**
 * Show template picker modal
 */
function showTemplates() {
  const modal = document.getElementById('templateModal');
  const grid = document.getElementById('templateGrid');

  // Populate template grid
  grid.innerHTML = Object.entries(PARTNER_TEMPLATES)
    .map(([key, template]) => `
      <div class="template-card" onclick="selectTemplate('${key}')" role="button" tabindex="0" aria-label="Select ${template.name}">
        <span class="template-icon">${template.icon}</span>
        <div class="template-name">${template.name}</div>
        <div class="template-description">${template.description}</div>
      </div>
    `).join('');

  modal.classList.add('show');
  modal.setAttribute('aria-hidden', 'false');

  // Focus first template
  setTimeout(() => {
    const firstTemplate = grid.querySelector('.template-card');
    if (firstTemplate) firstTemplate.focus();
  }, 100);
}

/**
 * Close template picker modal
 */
function closeTemplates() {
  const modal = document.getElementById('templateModal');
  modal.classList.remove('show');
  modal.setAttribute('aria-hidden', 'true');
}

/**
 * Select a template and redirect to bridge form
 */
function selectTemplate(templateKey) {
  const template = PARTNER_TEMPLATES[templateKey];
  if (!template) {
    console.error('Template not found:', templateKey);
    return;
  }

  // Build URL with pre-filled data
  const params = new URLSearchParams({
    template: templateKey,
    name: `${template.name} Bridge`,
    type: 'api',
    direction: template.type,
    authMethod: template.defaultAuth
  });

  window.location.href = `/bridge-form.html?${params.toString()}`;
}

/**
 * Quick add from template chip
 */
function quickAdd(templateKey) {
  selectTemplate(templateKey);
}

/**
 * Create custom bridge (no template)
 */
function customBridge() {
  window.location.href = '/bridge-form.html';
}

// ============================================
// BRIDGE DETAIL MODAL
// ============================================

/**
 * Show bridge detail modal
 */
async function showBridgeDetail(bridgeId) {
  const modal = document.getElementById('bridgeDetailModal');
  const title = document.getElementById('bridgeDetailTitle');
  const content = document.getElementById('bridgeDetailContent');

  // Show loading state
  content.innerHTML = '<div style="text-align: center; padding: 40px;"><div class="spinner"></div></div>';
  modal.classList.add('show');
  modal.setAttribute('aria-hidden', 'false');

  try {
    const bridge = await fetchBridgeDetails(bridgeId);
    if (!bridge) {
      content.innerHTML = '<p>Bridge not found.</p>';
      return;
    }

    const partner = guessPartner(bridge);
    const successRate = calculateSuccessRate(bridge);

    title.textContent = bridge.name;
    content.innerHTML = `
      <div class="detail-section">
        <h3>Overview</h3>
        <div class="detail-info">
          <div class="info-item">
            <span class="info-label">Partner</span>
            <span class="info-value">${partner.icon} ${partner.name}</span>
          </div>
          <div class="info-item">
            <span class="info-label">Direction</span>
            <span class="info-value">${getDirectionIcon(bridge.direction)} ${getDirectionLabel(bridge.direction)}</span>
          </div>
          <div class="info-item">
            <span class="info-label">Status</span>
            <span class="info-value">${getStatusIcon(bridge.status)} ${bridge.status.charAt(0).toUpperCase() + bridge.status.slice(1)}</span>
          </div>
          <div class="info-item">
            <span class="info-label">Success Rate</span>
            <span class="info-value">${successRate}%</span>
          </div>
        </div>
      </div>

      <div class="detail-section">
        <h3>Recent Activity</h3>
        <ul class="recent-activity">
          ${bridge.recentActivity.map(activity => `
            <li class="activity-item">
              <span class="activity-status">${activity.status}</span>
              <div class="activity-info">
                <div class="activity-message">${activity.message}</div>
                <div class="activity-time">${activity.time}</div>
              </div>
            </li>
          `).join('')}
        </ul>
      </div>

      <div class="detail-actions">
        <button class="btn-primary" onclick="viewTransactions('${bridge.id}')">
          📊 View Transactions
        </button>
        <button class="btn-ghost" onclick="configureBridge('${bridge.id}')">
          ⚙️ Configure
        </button>
        <button class="btn-ghost" onclick="testBridge('${bridge.id}')">
          🧪 Test Connection
        </button>
      </div>
    `;
  } catch (error) {
    console.error('Error loading bridge details:', error);
    content.innerHTML = '<p>Failed to load bridge details. Please try again.</p>';
  }
}

/**
 * Close bridge detail modal
 */
function closeBridgeDetail() {
  const modal = document.getElementById('bridgeDetailModal');
  modal.classList.remove('show');
  modal.setAttribute('aria-hidden', 'true');
}

/**
 * View transactions for a bridge
 */
function viewTransactions(bridgeId) {
  window.location.href = `/transactions.html?bridge=${bridgeId}`;
}

/**
 * Configure a bridge
 */
function configureBridge(bridgeId) {
  window.location.href = `/bridge-form.html?id=${bridgeId}`;
}

/**
 * Test bridge connection
 */
async function testBridge(bridgeId) {
  const bridge = bridges.find(b => b.id === bridgeId);
  if (!bridge) return;

  // In a real app, this would call the API
  alert(`Testing connection for "${bridge.name}"...\n\nThis would normally trigger a test API call.`);
}

// ============================================
// UI HELPERS
// ============================================

/**
 * Show loading overlay
 */
function showLoading() {
  const overlay = document.getElementById('loadingOverlay');
  if (overlay) {
    overlay.style.display = 'flex';
  }
}

/**
 * Hide loading overlay
 */
function hideLoading() {
  const overlay = document.getElementById('loadingOverlay');
  if (overlay) {
    overlay.style.display = 'none';
  }
}

/**
 * Show error message
 */
function showError(message) {
  // In a real app, this would use a toast/notification system
  alert(message);
}

// ============================================
// DEMO/TESTING HELPERS
// ============================================

/**
 * Add sample bridges for testing
 * Call this from console: addSampleBridges()
 */
window.addSampleBridges = function() {
  const sampleBridges = [
    {
      id: 'bridge-1',
      name: 'Shopify Orders',
      type: 'api',
      direction: 'inbound',
      status: 'active',
      sourceUrl: 'https://mystore.myshopify.com/api',
      transactionCount: 247,
      successCount: 247
    },
    {
      id: 'bridge-2',
      name: 'Stripe Payments',
      type: 'api',
      direction: 'outbound',
      status: 'active',
      targetUrl: 'https://api.stripe.com/v1',
      transactionCount: 189,
      successCount: 185
    },
    {
      id: 'bridge-3',
      name: 'QuickBooks Sync',
      type: 'api',
      direction: 'both',
      status: 'warning',
      targetUrl: 'https://quickbooks.api.intuit.com',
      transactionCount: 156,
      successCount: 148
    }
  ];

  localStorage.setItem('bridgeflow_bridges', JSON.stringify({ bridges: sampleBridges }));
  console.log('✅ Sample bridges added! Reloading...');
  location.reload();
};

/**
 * Clear all bridges
 * Call this from console: clearBridges()
 */
window.clearBridges = function() {
  localStorage.removeItem('bridgeflow_bridges');
  console.log('✅ Bridges cleared! Reloading...');
  location.reload();
};

console.log('Canvas Visual: Ready!');
console.log('💡 Try these commands in console:');
console.log('   - addSampleBridges() - Add sample bridges');
console.log('   - clearBridges() - Clear all bridges');
