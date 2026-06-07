/**
 * Reapeat App - Download APK Handler
 * Handles download button clicks on Homepage and Profile
 */

// Debounce helper to prevent multiple rapid clicks
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

// Trigger APK download
async function handleDownloadClick() {
  try {
    // Check if APK link is configured
    const response = await fetch('/api/settings/apk');
    const settings = await response.json();

    if (!settings.apkUrl) {
      showNotification(
        'APK download is not yet configured. Please contact the administrator.',
        'error'
      );
      return;
    }

    // Redirect to download endpoint which will redirect to the actual APK URL
    window.location.href = '/download-apk';
  } catch (error) {
    console.error('Download error:', error);
    showNotification(
      'Error initiating download. Please try again later.',
      'error'
    );
  }
}

// Show temporary notification
function showNotification(message, type = 'info') {
  const notification = document.createElement('div');
  notification.className = `notification notification-${type}`;
  notification.textContent = message;

  const style = document.createElement('style');
  style.textContent = `
    .notification {
      position: fixed;
      top: 20px;
      right: 20px;
      padding: 1rem 1.5rem;
      border-radius: 0.5rem;
      z-index: 9999;
      animation: slideIn 0.3s ease;
      max-width: 90%;
    }
    @keyframes slideIn {
      from {
        transform: translateX(400px);
        opacity: 0;
      }
      to {
        transform: translateX(0);
        opacity: 1;
      }
    }
    .notification-success {
      background-color: #d1fae5;
      color: #065f46;
      border-left: 4px solid #10b981;
    }
    .notification-error {
      background-color: #fee2e2;
      color: #991b1b;
      border-left: 4px solid #ef4444;
    }
    .notification-info {
      background-color: #dbeafe;
      color: #0c2340;
      border-left: 4px solid #3b82f6;
    }
  `;

  if (!document.querySelector('style[data-notification]')) {
    style.setAttribute('data-notification', 'true');
    document.head.appendChild(style);
  }

  document.body.appendChild(notification);

  // Auto-remove after 4 seconds
  setTimeout(() => {
    notification.style.animation = 'slideOut 0.3s ease';
    setTimeout(() => notification.remove(), 300);
  }, 4000);
}

// Initialize download buttons
document.addEventListener('DOMContentLoaded', () => {
  const downloadBtn = document.getElementById('downloadBtn');
  const downloadBtn2 = document.getElementById('downloadBtn2');
  const downloadBtnProfile = document.getElementById('downloadBtnProfile');

  const debouncedDownload = debounce(handleDownloadClick, 300);

  if (downloadBtn) {
    downloadBtn.addEventListener('click', debouncedDownload);
  }

  if (downloadBtn2) {
    downloadBtn2.addEventListener('click', debouncedDownload);
  }

  if (downloadBtnProfile) {
    downloadBtnProfile.addEventListener('click', debouncedDownload);
  }
});