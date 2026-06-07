async function getApkSettings() {
  const response = await fetch('/api/settings/apk', { cache: 'no-store' });

  if (!response.ok) {
    throw new Error('Unable to check the latest APK link. Please try again.');
  }

  return response.json();
}

function setStatus(element, message, type = 'success') {
  if (!element) {
    return;
  }

  element.textContent = message;
  element.className = `status ${type}`;
}

async function handleDownloadClick(event) {
  const status = document.querySelector('[data-download-status]');
  const button = event.currentTarget;
  button.disabled = true;
  setStatus(status, 'Checking for the latest app version...', 'success');

  try {
    const settings = await getApkSettings();

    if (!settings.apkUrl) {
      setStatus(status, 'The APK download link has not been configured by an admin yet.', 'error');
      return;
    }

    setStatus(status, 'Starting the latest APK download...', 'success');
    window.location.assign('/download-apk');
  } catch (error) {
    setStatus(status, error.message, 'error');
  } finally {
    button.disabled = false;
  }
}

document.querySelectorAll('[data-download-app]').forEach((button) => {
  button.addEventListener('click', handleDownloadClick);
});
