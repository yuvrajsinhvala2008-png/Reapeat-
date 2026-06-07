const http = require('node:http');
const fs = require('node:fs/promises');
const path = require('node:path');
const { URL } = require('node:url');

const DEFAULT_PORT = process.env.PORT || 3000;
const PUBLIC_DIR = path.join(__dirname, 'public');
const DEFAULT_SETTINGS_FILE = path.join(__dirname, 'data', 'settings.json');
const MAX_BODY_BYTES = 1024 * 1024;

const contentTypes = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
};

async function ensureSettingsFile(settingsFile) {
  await fs.mkdir(path.dirname(settingsFile), { recursive: true });

  try {
    await fs.access(settingsFile);
  } catch {
    await fs.writeFile(settingsFile, JSON.stringify({ apkUrl: '', updatedAt: null }, null, 2));
  }
}

async function readSettings(settingsFile) {
  await ensureSettingsFile(settingsFile);
  const raw = await fs.readFile(settingsFile, 'utf8');
  const settings = JSON.parse(raw || '{}');

  return {
    apkUrl: typeof settings.apkUrl === 'string' ? settings.apkUrl : '',
    updatedAt: settings.updatedAt || null,
  };
}

async function writeSettings(settingsFile, nextSettings) {
  await ensureSettingsFile(settingsFile);
  await fs.writeFile(settingsFile, `${JSON.stringify(nextSettings, null, 2)}\n`);
  return nextSettings;
}

function isValidDownloadUrl(value) {
  if (typeof value !== 'string') {
    return false;
  }

  const trimmed = value.trim();
  if (!trimmed) {
    return true;
  }

  try {
    const parsed = new URL(trimmed);
    return parsed.protocol === 'https:' || parsed.protocol === 'http:';
  } catch {
    return false;
  }
}

function sendJson(response, statusCode, payload) {
  response.writeHead(statusCode, { 'content-type': 'application/json; charset=utf-8' });
  response.end(JSON.stringify(payload));
}

function readBody(request) {
  return new Promise((resolve, reject) => {
    let size = 0;
    let body = '';

    request.on('data', (chunk) => {
      size += chunk.length;
      if (size > MAX_BODY_BYTES) {
        reject(new Error('Request body is too large.'));
        request.destroy();
        return;
      }

      body += chunk;
    });

    request.on('end', () => resolve(body));
    request.on('error', reject);
  });
}

async function serveStatic(request, response, pathname) {
  const normalizedPath = pathname === '/' ? '/index.html' : pathname;
  const filePath = path.normalize(path.join(PUBLIC_DIR, normalizedPath));

  const relativePath = path.relative(PUBLIC_DIR, filePath);
  if (relativePath.startsWith('..') || path.isAbsolute(relativePath)) {
    sendJson(response, 403, { error: 'Forbidden' });
    return;
  }

  try {
    const file = await fs.readFile(filePath);
    const extension = path.extname(filePath);
    response.writeHead(200, { 'content-type': contentTypes[extension] || 'application/octet-stream' });
    response.end(file);
  } catch (error) {
    if (error.code === 'ENOENT') {
      sendJson(response, 404, { error: 'Not found' });
      return;
    }

    throw error;
  }
}

function createServer(options = {}) {
  const settingsFile = options.settingsFile || DEFAULT_SETTINGS_FILE;

  return http.createServer(async (request, response) => {
    try {
      const requestUrl = new URL(request.url, `http://${request.headers.host || 'localhost'}`);

      if (requestUrl.pathname === '/api/settings/apk' && request.method === 'GET') {
        const settings = await readSettings(settingsFile);
        sendJson(response, 200, settings);
        return;
      }

      if (requestUrl.pathname === '/api/settings/apk' && (request.method === 'POST' || request.method === 'PUT')) {
        const body = await readBody(request);
        const payload = body ? JSON.parse(body) : {};
        const apkUrl = typeof payload.apkUrl === 'string' ? payload.apkUrl.trim() : '';

        if (!isValidDownloadUrl(apkUrl)) {
          sendJson(response, 400, { error: 'APK link must be a valid http:// or https:// URL.' });
          return;
        }

        const settings = await writeSettings(settingsFile, {
          apkUrl,
          updatedAt: new Date().toISOString(),
        });
        sendJson(response, 200, settings);
        return;
      }

      if (requestUrl.pathname === '/download-apk' && request.method === 'GET') {
        const settings = await readSettings(settingsFile);

        if (!settings.apkUrl) {
          sendJson(response, 404, { error: 'APK download link has not been configured yet.' });
          return;
        }

        response.writeHead(302, {
          location: settings.apkUrl,
          'cache-control': 'no-store',
        });
        response.end();
        return;
      }

      if (request.method === 'GET' || request.method === 'HEAD') {
        await serveStatic(request, response, requestUrl.pathname);
        return;
      }

      sendJson(response, 405, { error: 'Method not allowed' });
    } catch (error) {
      if (error instanceof SyntaxError) {
        sendJson(response, 400, { error: 'Invalid JSON payload.' });
        return;
      }

      sendJson(response, 500, { error: 'Unexpected server error.' });
    }
  });
}

if (require.main === module) {
  createServer().listen(DEFAULT_PORT, () => {
    console.log(`Reapeat platform running at http://localhost:${DEFAULT_PORT}`);
  });
}

module.exports = {
  createServer,
  isValidDownloadUrl,
  readSettings,
  writeSettings,
};
