/**
 * Reapeat Admin Panel - APK Management
 * Handles APK URL configuration and management
 */

const API_ENDPOINT = '/api/settings/apk';

// Elements
const apkUrlInput = document.getElementById('apkUrl');
const saveBtn = document.getElementById('saveBtn');
const testBtn = document.getElementById('testBtn');
const statusMessage = document.getElementById('statusMessage');
const currentUrlDisplay = document.getElementById('currentUrl');
const updatedAtDisplay = document.getElementById('updatedAt');
const urlStatus = document.getElementById('urlStatus');
const statusBadge = document.getElementById('statusBadge');

/**
 * Load current settings from server
 */
async function loadSettings() {
  try {
    const response = await fetch(API_ENDPOINT);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Failed to load settings');
    }

    // Update displays
    apkUrlInput.value = data.apkUrl || '';
    currentUrlDisplay.textContent = data.apkUrl || 'Not configured';

    if (data.updatedAt) {
      const date = new Date(data.updatedAt);
      updatedAtDisplay.textContent = date.toLocaleString();
      statusBadge.textContent = 'Configured ✓';
      statusBadge.className = 'status-badge configured';
    } else {
      updatedAtDisplay.textContent = 'Not configured';
      statusBadge.textContent = 'Not configured';
      statusBadge.className = 'status-badge not-configured';
    }
  } catch (error) {
    console.error('Load settings error:', error);
    showStatus('Error loading settings', 'error');
  }
}

/**
 * Save APK URL to server
 */
async function saveSettings() {
  const apkUrl = apkUrlInput.value.trim();

  if (!apkUrl) {
    showStatus('Please enter an APK URL', 'error');
    return;
  }

  // Basic URL validation
  try {
    new URL(apkUrl);
  } catch {
    showStatus('Invalid URL format. Please enter a valid HTTP/HTTPS URL', 'error');
    return;
  }

  try {
    toggleButtonsState(true);
    saveBtn.textContent = '💾 Saving...';

    const response = await fetch(API_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ apkUrl }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Failed to save settings');
    }

    showStatus('✓ APK link saved successfully!', 'success');
    loadSettings();
  } catch (error) {
    console.error('Save settings error:', error);
    showStatus(
      `Error: ${error.message || 'Failed to save settings'}`,
      'error'
    );
  } finally {
    toggleButtonsState(false);
    saveBtn.textContent = '💾 Save APK Link';
  }
}

/**
 * Test download functionality
 */
async function testDownload() {
  const apkUrl = apkUrlInput.value.trim();

  if (!apkUrl) {
    showStatus('Please enter an APK URL first', 'error');
    return;
  }

  try {
    toggleButtonsState(true);
    testBtn.textContent = '🧪 Testing...';

    // Test if the endpoint works
    const response = await fetch('/download-apk');

    if (response.status === 302 || response.status === 301) {
      showStatus('✓ Download endpoint is working correctly!', 'success');
    } else if (response.status === 404) {
      showStatus('⚠ APK URL is not configured yet', 'error');
    } else {
      showStatus('⚠ Download endpoint responded with status: ' + response.status, 'info');
    }
  } catch (error) {
    console.error('Test download error:', error);
    showStatus(
      'Error testing download. Please check the URL and try again.',
      'error'
    );
  } finally {
    toggleButtonsState(false);
    testBtn.textContent = '🧪 Test Download';
  }
}

/**
 * Show status message
 */
function showStatus(message, type = 'info') {
  statusMessage.textContent = message;
  statusMessage.className = `status-message show ${type}`;

  // Auto-hide success messages after 4 seconds
  if (type === 'success') {
    setTimeout(() => {
      statusMessage.classList.remove('show');
    }, 4000);
  }
}

/**
 * Toggle button states (loading/disabled)
 */
function toggleButtonsState(isLoading) {
  saveBtn.disabled = isLoading;
  testBtn.disabled = isLoading;

  if (isLoading) {
    saveBtn.classList.add('loading');
    testBtn.classList.add('loading');
  } else {
    saveBtn.classList.remove('loading');
    testBtn.classList.remove('loading');
  }
}

/**
 * Initialize event listeners
 */
function initEventListeners() {
  saveBtn.addEventListener('click', saveSettings);
  testBtn.addEventListener('click', testDownload);

  // Allow Enter key to save
  apkUrlInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      saveSettings();
    }
  });
}

/**
 * Initialize admin panel
 */
document.addEventListener('DOMContentLoaded', () => {
  loadSettings();
  initEventListeners();
});