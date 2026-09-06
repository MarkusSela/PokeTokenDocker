const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { buildCapabilities } = require('../core/capabilities.cjs');
const { createWebServer, actionRequestError } = require('../server/http-server.cjs');

async function json(response) {
  return response.json();
}

async function withServer(options, callback) {
  const server = createWebServer(options);
  await server.start();
  try {
    const address = server.address();
    return await callback(`http://127.0.0.1:${address.port}`, server);
  } finally {
    await server.close();
  }
}

function fixtureSnapshot() {
  return {
    schemaVersion: 1,
    mode: 'web-local',
    readOnly: false,
    capabilities: buildCapabilities({ mode: 'web-local', platform: 'linux', env: {} }),
    wallet: 123,
    settings: { language: 'it' },
    active: null,
    egg: { progress: 0.25, remaining: 3_750_000, tier: 'common' },
    usage: { today: { tokens: 42 }, todayProviders: [] },
  };
}

test('web server exposes health, capabilities, and sanitized snapshots', async () => {
  const capabilities = buildCapabilities({ mode: 'web-local', platform: 'linux', env: {} });
  const snapshot = fixtureSnapshot();
  const service = {
    getCapabilities: () => capabilities,
    getSnapshot: async () => snapshot,
  };

  const publicConfig = {
    projectUrl: 'https://github.com/MarkusSela/PokeTokenDocker',
    issuesUrl: 'https://github.com/MarkusSela/PokeTokenDocker/issues',
    releaseUrl: 'https://api.github.com/repos/MarkusSela/PokeTokenDocker/releases/latest',
  };
  await withServer({ service, publicConfig }, async (base) => {
    const health = await fetch(`${base}/healthz`);
    assert.equal(health.status, 200);
    assert.equal(health.headers.get('cache-control'), 'no-store');
    assert.deepEqual(await json(health), {
      ok: true,
      service: 'poketokendocker',
      mode: 'web-local',
    });

    const capabilityResponse = await fetch(`${base}/api/capabilities`);
    assert.equal(capabilityResponse.status, 200);
    assert.equal((await json(capabilityResponse)).floatingPet, false);

    const snapshotResponse = await fetch(`${base}/api/snapshot`);
    assert.equal(snapshotResponse.status, 200);
    assert.equal((await json(snapshotResponse)).egg.progress, 0.25);

    const configResponse = await fetch(`${base}/api/config`);
    assert.equal(configResponse.status, 200);
    assert.deepEqual(await json(configResponse), { product: 'PokeTokenDocker', ...publicConfig });
  });
});

test('web server sanitizes raw service snapshots and capabilities at the HTTP boundary', async () => {
  const capabilities = {
    ...buildCapabilities({ mode: 'web-local', platform: 'linux', env: {} }),
    sourcePath: '/private/hermes/state.db',
  };
  const raw = {
    ...fixtureSnapshot(),
    capabilities,
    usage: {
      ...fixtureSnapshot().usage,
      source: '/private/hermes/state.db',
      progressionRows: [{ key: 'session:/private/secret', tokens: 7 }],
    },
    error: 'raw failure at /private/hermes/state.db with prompt text',
  };
  const service = {
    getCapabilities: () => capabilities,
    getSnapshot: async () => raw,
  };

  await withServer({ service }, async (base, server) => {
    const capabilityResponse = await fetch(`${base}/api/capabilities`);
    const publicCapabilities = await json(capabilityResponse);
    assert.equal(capabilityResponse.status, 200);
    assert.equal(publicCapabilities.sourcePath, undefined);
    assert.equal(publicCapabilities.mode, 'web-local');

    const snapshotResponse = await fetch(`${base}/api/snapshot`);
    const snapshot = await json(snapshotResponse);
    assert.equal(snapshotResponse.status, 200);
    assert.equal(snapshot.usage.source, undefined);
    assert.equal(snapshot.usage.progressionRows, undefined);
    assert.equal(snapshot.error.message, 'Usage refresh unavailable');
    assert.equal(JSON.stringify(snapshot).includes('/private'), false);
    assert.equal(JSON.stringify(snapshot).includes('prompt'), false);

    const controller = new AbortController();
    const events = await fetch(`${base}/api/events`, { signal: controller.signal });
    const reader = events.body.getReader();
    await reader.read();
    server.publishSnapshot(raw);
    const published = await reader.read();
    const eventText = new TextDecoder().decode(published.value);
    assert.equal(eventText.includes('/private'), false);
    assert.equal(eventText.includes('prompt'), false);
    await reader.cancel();
    controller.abort();
  });
});

test('web server allowlists actions and refuses mutations in read-only mode', async () => {
  const calls = [];
  const localCapabilities = buildCapabilities({ mode: 'web-local', platform: 'linux', env: {} });
  const localService = {
    getCapabilities: () => localCapabilities,
    getSnapshot: async () => fixtureSnapshot(),
    handleAction: async (type, value) => {
      calls.push({ type, value });
      return { ok: true, snapshot: fixtureSnapshot() };
    },
  };

  await withServer({ service: localService }, async (base) => {
    const accepted = await fetch(`${base}/api/action`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ type: 'buy', value: 'mint' }),
    });
    assert.equal(accepted.status, 200);
    assert.deepEqual(calls, [{ type: 'buy', value: 'mint' }]);

    const testOnlyMutation = await fetch(`${base}/api/action`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ type: 'grant-one-time', value: { key: 'demo' } }),
    });
    assert.equal(testOnlyMutation.status, 403);

    const rejected = await fetch(`${base}/api/action`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ type: 'unknown' }),
    });
    assert.equal(rejected.status, 403);
    assert.equal((await json(rejected)).error.code, 'ACTION_NOT_ALLOWED');
  });

  const readOnlyCapabilities = buildCapabilities({
    mode: 'public-readonly',
    platform: 'linux',
    env: {},
    readOnly: true,
  });
  const readOnlyCalls = [];
  const readOnlyService = {
    getCapabilities: () => readOnlyCapabilities,
    getSnapshot: async () => ({ ...fixtureSnapshot(), mode: 'public-readonly', readOnly: true }),
    handleAction: async (...args) => readOnlyCalls.push(args),
  };
  await withServer({ service: readOnlyService }, async (base) => {
    const rejected = await fetch(`${base}/api/action`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ type: 'buy', value: 'mint' }),
    });
    assert.equal(rejected.status, 403);
    assert.deepEqual(readOnlyCalls, []);
  });
});

test('web server rejects non-JSON and cross-origin action requests before dispatch', async () => {
  const calls = [];
  const capabilities = buildCapabilities({ mode: 'web-local', platform: 'linux', env: {} });
  const service = {
    getCapabilities: () => capabilities,
    getSnapshot: async () => fixtureSnapshot(),
    handleAction: async (...args) => {
      calls.push(args);
      return { ok: true };
    },
  };

  await withServer({ service }, async (base) => {
    const sameOrigin = await fetch(`${base}/api/action`, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        origin: base,
      },
      body: JSON.stringify({ type: 'buy', value: 'mint' }),
    });
    assert.equal(sameOrigin.status, 200);

    assert.equal(actionRequestError({
      headers: {
        'content-type': 'application/json',
        host: 'dashboard.local:4317',
        origin: 'http://dashboard.local:4317',
      },
    }), null);

    const nonJson = await fetch(`${base}/api/action`, {
      method: 'POST',
      headers: { 'content-type': 'text/plain' },
      body: JSON.stringify({ type: 'buy', value: 'mint' }),
    });
    assert.equal(nonJson.status, 415);
    assert.equal((await json(nonJson)).error.code, 'UNSUPPORTED_MEDIA_TYPE');

    const forgedOrigin = await fetch(`${base}/api/action`, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        origin: 'https://attacker.example',
      },
      body: JSON.stringify({ type: 'buy', value: 'mint' }),
    });
    assert.equal(forgedOrigin.status, 403);
    assert.equal((await json(forgedOrigin)).error.code, 'CSRF_REJECTED');

    const mismatchedOrigin = await fetch(`${base}/api/action`, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        origin: 'http://attacker.example',
      },
      body: JSON.stringify({ type: 'buy', value: 'mint' }),
    });
    assert.equal(mismatchedOrigin.status, 403);
    assert.equal((await json(mismatchedOrigin)).error.code, 'CSRF_REJECTED');

    const crossSite = await fetch(`${base}/api/action`, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'sec-fetch-site': 'cross-site',
      },
      body: JSON.stringify({ type: 'buy', value: 'mint' }),
    });
    assert.equal(crossSite.status, 403);
    assert.equal((await json(crossSite)).error.code, 'CSRF_REJECTED');
    assert.deepEqual(calls, [['buy', 'mint']]);
  });
});

test('web server rejects oversized or malformed action bodies', async () => {
  const service = {
    getCapabilities: () => buildCapabilities({ mode: 'web-local', platform: 'linux', env: {} }),
    getSnapshot: async () => fixtureSnapshot(),
    handleAction: async () => ({ ok: true }),
  };
  await withServer({ service, maxBodyBytes: 64 }, async (base) => {
    const oversized = await fetch(`${base}/api/action`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ type: 'buy', value: 'x'.repeat(200) }),
    });
    assert.equal(oversized.status, 413);

    const malformed = await fetch(`${base}/api/action`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: '{not-json',
    });
    assert.equal(malformed.status, 400);
    assert.equal((await json(malformed)).error.code, 'INVALID_JSON');
  });
});

test('web server serves only the configured web root and assets', async () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'ptb-web-server-'));
  const webRoot = path.join(root, 'web');
  const assetRoot = path.join(root, 'assets');
  fs.mkdirSync(webRoot, { recursive: true });
  fs.mkdirSync(assetRoot, { recursive: true });
  fs.writeFileSync(path.join(webRoot, 'index.html'), '<h1>PokeTokenDocker Home</h1>');
  fs.writeFileSync(path.join(webRoot, 'mini.html'), '<h1>PokeTokenDocker mini</h1>');
  fs.writeFileSync(path.join(assetRoot, 'icon.txt'), 'asset');
  fs.writeFileSync(path.join(root, 'private.txt'), 'do not serve');
  const service = {
    getCapabilities: () => buildCapabilities({ mode: 'web-local', platform: 'linux', env: {} }),
    getSnapshot: async () => fixtureSnapshot(),
  };

  try {
    await withServer({ service, staticRoot: webRoot, assetRoot, embedOrigin: 'http://127.0.0.1:9000' }, async (base) => {
      const home = await fetch(`${base}/`);
      assert.equal(home.status, 200);
      assert.match(await home.text(), /PokeTokenDocker Home/);
      assert.match(
        home.headers.get('content-security-policy'),
        /frame-ancestors 'none'/,
      );

      const mini = await fetch(`${base}/mini.html`);
      assert.equal(mini.status, 200);
      assert.match(
        mini.headers.get('content-security-policy'),
        /frame-ancestors http:\/\/127\.0\.0\.1:9000/,
      );

      const asset = await fetch(`${base}/assets/icon.txt`);
      assert.equal(asset.status, 200);
      assert.equal(await asset.text(), 'asset');

      const traversal = await fetch(`${base}/../private.txt`);
      assert.equal(traversal.status, 404);
    });
  } finally {
    fs.rmSync(root, { recursive: true, force: true });
  }
});

test('web server exposes safe export and update action results', async () => {
  const capabilities = buildCapabilities({ mode: 'web-local', platform: 'linux', env: {} });
  const service = {
    getCapabilities: () => capabilities,
    getSnapshot: async () => fixtureSnapshot(),
    handleAction: async (type) => type === 'export-save'
      ? {
        ok: true,
        save: {
          usedSinceInstall: 42,
          settings: { additionalScanFolders: ['/private/path'] },
          claimedUsageByRow: { 'session:/private/path': 10 },
          claimedUsageMetricsByRow: { 'session:/private/path': { tokens: 10 } },
        },
      }
      : {
        ok: true,
        update: {
          ok: true,
          currentVersion: '0.1.0',
          latestVersion: '0.2.0',
          updateAvailable: true,
          url: 'https://github.com/MarkusSela/PokeTokenDocker/releases/tag/v0.2.0',
          assetUrl: 'https://github.com/MarkusSela/PokeTokenDocker/releases/download/v0.2.0/app.exe',
        },
      },
  };

  await withServer({
    service,
    publicConfig: {
      projectUrl: 'https://github.com/MarkusSela/PokeTokenDocker',
      issuesUrl: 'https://github.com/MarkusSela/PokeTokenDocker/issues',
      releaseUrl: 'https://api.github.com/repos/MarkusSela/PokeTokenDocker/releases/latest',
    },
  }, async (base) => {
    const exported = await fetch(`${base}/api/action`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ type: 'export-save' }),
    });
    const save = await json(exported);
    assert.equal(exported.status, 200);
    assert.equal(save.save.usedSinceInstall, 42);
    assert.equal('additionalScanFolders' in save.save.settings, false);
    assert.equal('claimedUsageByRow' in save.save, false);
    assert.equal('claimedUsageMetricsByRow' in save.save, false);

    const update = await fetch(`${base}/api/action`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ type: 'check-update' }),
    });
    const updatePayload = await json(update);
    assert.equal(update.status, 200);
    assert.equal(updatePayload.update.latestVersion, '0.2.0');
    assert.equal(updatePayload.update.assetUrl.endsWith('/app.exe'), true);
  });
});
