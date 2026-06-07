const assert = require('node:assert/strict');
const fs = require('node:fs/promises');
const os = require('node:os');
const path = require('node:path');
const { test } = require('node:test');
const { createServer, isValidDownloadUrl } = require('../server');

function listen(server) {
  return new Promise((resolve) => {
    server.listen(0, () => {
      const { port } = server.address();
      resolve(`http://127.0.0.1:${port}`);
    });
  });
}

function close(server) {
  return new Promise((resolve) => server.close(resolve));
}

test('validates APK download URLs', () => {
  assert.equal(isValidDownloadUrl('https://cdn.example.com/app.apk'), true);
  assert.equal(isValidDownloadUrl('http://cdn.example.com/app.apk'), true);
  assert.equal(isValidDownloadUrl(''), true);
  assert.equal(isValidDownloadUrl('javascript:alert(1)'), false);
  assert.equal(isValidDownloadUrl('not-a-url'), false);
});

test('admin can save APK URL and download endpoint redirects to latest URL', async () => {
  const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'reapeat-apk-'));
  const server = createServer({ settingsFile: path.join(tempDir, 'settings.json') });
  const baseUrl = await listen(server);

  try {
    const saveResponse = await fetch(`${baseUrl}/api/settings/apk`, {
      method: 'PUT',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ apkUrl: 'https://downloads.example.com/reapeat-v2.apk' }),
    });
    assert.equal(saveResponse.status, 200);

    const settingsResponse = await fetch(`${baseUrl}/api/settings/apk`);
    const settings = await settingsResponse.json();
    assert.equal(settings.apkUrl, 'https://downloads.example.com/reapeat-v2.apk');
    assert.ok(settings.updatedAt);

    const downloadResponse = await fetch(`${baseUrl}/download-apk`, { redirect: 'manual' });
    assert.equal(downloadResponse.status, 302);
    assert.equal(downloadResponse.headers.get('location'), 'https://downloads.example.com/reapeat-v2.apk');
  } finally {
    await close(server);
  }
});

test('download endpoint reports when admin has not configured an APK URL', async () => {
  const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'reapeat-apk-empty-'));
  const server = createServer({ settingsFile: path.join(tempDir, 'settings.json') });
  const baseUrl = await listen(server);

  try {
    const response = await fetch(`${baseUrl}/download-apk`, { redirect: 'manual' });
    const payload = await response.json();
    assert.equal(response.status, 404);
    assert.match(payload.error, /not been configured/i);
  } finally {
    await close(server);
  }
});
