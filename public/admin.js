const form = document.querySelector('[data-apk-form]');
const apkInput = document.querySelector('[data-apk-input]');
const status = document.querySelector('[data-admin-status]');
const currentLink = document.querySelector('[data-current-apk]');

function setAdminStatus(message, type = 'success') {
  status.textContent = message;
  status.className = `status ${type}`;
}

async function loadCurrentApkLink() {
  const response = await fetch('/api/settings/apk', { cache: 'no-store' });

  if (!response.ok) {
    throw new Error('Could not load the current APK link.');
  }

  const settings = await response.json();
  apkInput.value = settings.apkUrl || '';
  currentLink.textContent = settings.apkUrl || 'No APK link configured yet.';
}

async function saveApkLink(event) {
  event.preventDefault();
  setAdminStatus('Saving APK link...', 'success');

  const response = await fetch('/api/settings/apk', {
    method: 'PUT',
    headers: {
      'content-type': 'application/json',
    },
    body: JSON.stringify({ apkUrl: apkInput.value }),
  });

  const payload = await response.json();

  if (!response.ok) {
    setAdminStatus(payload.error || 'Unable to save APK link.', 'error');
    return;
  }

  currentLink.textContent = payload.apkUrl || 'No APK link configured yet.';
  setAdminStatus('APK download link saved. Users will now receive this latest APK automatically.', 'success');
}

form.addEventListener('submit', saveApkLink);
loadCurrentApkLink().catch((error) => setAdminStatus(error.message, 'error'));
