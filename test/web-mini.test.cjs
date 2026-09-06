const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { buildCapabilities } = require('../core/capabilities.cjs');
const { createWebServer } = require('../server/http-server.cjs');

const root = path.join(__dirname, '..');
const miniFile = path.join(root, 'web', 'mini.html');

function miniSource() {
  return fs.existsSync(miniFile) ? fs.readFileSync(miniFile, 'utf8') : '';
}

function miniService() {
  return {
    getSnapshot: async () => ({
      mode: 'docker-local',
      readOnly: false,
      state: { dex: [] },
      egg: { progress: 0.25, remaining: 3_750_000, sprite: 'assets/emerald-egg-static.png' },
      usage: { today: { tokens: 42 } },
      lastRefreshAt: 0,
    }),
    getCapabilities: () => buildCapabilities({
      mode: 'docker-local',
      platform: 'linux',
      env: { PTD_WEB_ALLOW_MUTATIONS: '1', PTD_BIND_HOST: '127.0.0.1' },
      readOnly: false,
    }),
    handleAction: async () => ({ ok: true }),
  };
}

test('Homepage Mini view is included and uses the Docker snapshot contract', () => {
  const source = miniSource();
  assert.equal(fs.existsSync(miniFile), true, 'web/mini.html must be shipped with the Docker package');
  assert.match(source, /<html\s+lang="en">/i);
  assert.match(source, /<title>PokeTokenDocker companion<\/title>/i);
  assert.match(source, /background:\s*transparent/);
  assert.match(source, /main\s*\{[^}]*width:\s*320px/);
  assert.match(source, /font-family:\s*Inter,\s*ui-sans-serif,\s*system-ui,\s*-apple-system,\s*BlinkMacSystemFont,\s*"Segoe UI"/);
  for (const id of ['mini-sprite', 'mini-fallback', 'mini-name', 'mini-detail', 'mini-progress', 'mini-today', 'mini-dex', 'mini-status', 'mini-updated', 'mini-refresh'])
    assert.match(source, new RegExp(`id="${id}"`));
  for (const endpoint of ['/api/snapshot', '/api/action', '/api/events'])
    assert.match(source, new RegExp(endpoint.replace('/', '\\/')));
  assert.match(source, /type:\s*['"]refresh['"]/);
  assert.match(source, /safeImage[\s\S]*assets/);
  assert.doesNotMatch(source, /innerHTML\s*=/);
  assert.doesNotMatch(source, /eval\s*\(/);
  assert.doesNotMatch(source, /file:\/\//i);
});

test('Mini view is embeddable only through the configured Homepage origin', async () => {
  const web = createWebServer({
    service: miniService(),
    host: '127.0.0.1',
    staticRoot: path.join(root, 'web'),
    assetRoot: path.join(root, 'assets'),
    embedOrigin: 'https://homepage.example',
    allowedHosts: new Set(['127.0.0.1', 'localhost']),
  });
  try {
    await web.start();
    const base = `http://127.0.0.1:${web.address().port}`;
    const mini = await fetch(`${base}/mini.html`);
    assert.equal(mini.status, 200);
    assert.match(mini.headers.get('content-security-policy') || '', /frame-ancestors https:\/\/homepage\.example/);
    assert.match(await mini.text(), /PokeTokenDocker companion/);

    const home = await fetch(`${base}/`);
    assert.equal(home.status, 200);
    assert.match(home.headers.get('content-security-policy') || '', /frame-ancestors 'none'/);
  } finally {
    await web.close();
  }
});
