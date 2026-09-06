const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');

const { Game, BALANCE } = require('../core/game.cjs');
const { sanitizeSnapshot } = require('../core/snapshot-contract.cjs');
const { actionAllowed, buildCapabilities } = require('../core/capabilities.cjs');
const { cloneExportState, createLocalService, importedState } = require('../core/local-service.cjs');
const { configuredMode } = require('../server/cli.cjs');
const { createWebServer } = require('../server/http-server.cjs');
const catalog = require('../web/i18n.js');

const root = path.join(__dirname, '..');

function catalogEntry(baseId, pathIds = [baseId], rarity = 'common', captureRate = 200) {
  return {
    id: baseId,
    captureRate,
    line: {
      baseId,
      pathIds,
      rarity,
      names: Object.fromEntries(pathIds.map((id) => [id, { en: `Pokemon ${id}`, it: `Pokémon ${id}` }])),
    },
  };
}

function emptyUsage() {
  return {
    date: '2026-09-03',
    today: {},
    week: {},
    month: {},
    block5h: {},
    providers: [],
    todayProviders: [],
    progressionRows: [],
    officialAvailable: false,
    limitWindows: [],
  };
}

test('Docker mutations fail closed without explicit loopback opt-in', async () => {
  const disabledEnv = {
    PTD_WEB_CONTAINER: '1',
    PTD_WEB_MODE: 'docker-local',
    PTD_WEB_ALLOW_MUTATIONS: '0',
    PTD_BIND_HOST: '127.0.0.1',
  };
  assert.equal(configuredMode(disabledEnv), 'public-readonly');
  const disabledCapabilities = buildCapabilities({
    mode: 'docker-local',
    platform: 'linux',
    env: disabledEnv,
    readOnly: false,
  });
  assert.equal(disabledCapabilities.readOnly, true);
  assert.equal(disabledCapabilities.actions, false);

  const wildcardEnv = { ...disabledEnv, PTD_WEB_ALLOW_MUTATIONS: '1', PTD_BIND_HOST: '0.0.0.0' };
  assert.equal(configuredMode(wildcardEnv), 'public-readonly');
  const wildcardCapabilities = buildCapabilities({
    mode: 'docker-local',
    platform: 'linux',
    env: wildcardEnv,
    readOnly: false,
  });
  assert.equal(wildcardCapabilities.actions, false);

  const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'ptd-review-policy-'));
  try {
    const service = createLocalService({
      mode: 'docker-local',
      platform: 'linux',
      env: { ...disabledEnv, HOME: directory },
      stateFile: path.join(directory, 'companion-state.json'),
      state: { settings: { language: 'en' } },
      hermesReader: async () => emptyUsage(),
      localReader: async () => emptyUsage(),
      scanReader: async () => ({ totalRows: 0, unattributedRows: 0, timeWindowedRows: 0, providers: [] }),
      readOnly: false,
      persist: true,
    });
    const result = await service.handleAction('setting', { key: 'language', value: 'it' });
    assert.equal(result.ok, false);
    assert.equal(service.game.state.settings.language, 'en');
    assert.equal(fs.existsSync(path.join(directory, 'companion-state.json')), false);
  } finally {
    fs.rmSync(directory, { recursive: true, force: true });
  }
});

test('export uses a strict allowlist and removes arbitrary personal fields', () => {
  const exported = cloneExportState({
    usedSinceInstall: 42,
    spentTokens: 3,
    settings: { language: 'it', additionalScanFolders: ['/private/folder'], secretSetting: 'remove' },
    active: {
      baseId: 25,
      pathIds: [25],
      plannedPathIds: [25],
      dittoDisguise: 25,
      secretActiveField: '/private/active',
    },
    dex: [{
      id: 'legacy',
      baseId: 25,
      finalId: 25,
      chainOrder: [25],
      secretPath: '/private/dex',
    }],
    liveUsageDisplay: { secretPath: '/private/live', previousRaw: { sourcePath: '/private/raw' } },
    floatingPetPosition: { x: 10, y: 20 },
    claimedUsageByRow: { 'session:/private/path': 10 },
    claimedUsageMetricsByRow: { 'session:/private/path': { tokens: 10 } },
  });
  assert.equal(exported.settings.additionalScanFolders, undefined);
  assert.equal(exported.settings.secretSetting, undefined);
  assert.equal(exported.active.secretActiveField, undefined);
  assert.equal(exported.dex[0].secretPath, undefined);
  assert.equal(exported.liveUsageDisplay, undefined);
  assert.equal(exported.floatingPetPosition, undefined);
  assert.equal(exported.claimedUsageByRow, undefined);
  assert.equal(exported.claimedUsageMetricsByRow, undefined);
  assert.equal(exported.active.dittoDisguise, 25);
  assert.equal(exported.usedSinceInstall, 42);
});

test('Ditto disguise ids survive state normalization and reload', () => {
  const restored = new Game({
    state: {
      active: {
        baseId: 25,
        pathIds: [25],
        plannedPathIds: [25],
        stageIndex: 0,
        dittoDisguise: 25,
      },
    },
  });
  assert.equal(restored.state.active.dittoDisguise, 25);
});

test('exhausted Poke Doll pool is visible and disabling the doll recovers the egg', () => {
  const entry = catalogEntry(1, [1, 2, 3]);
  const game = new Game({
    catalog: [entry],
    rng: () => 0,
    state: {
      eggUsage: BALANCE.eggHatch,
      inventory: { pokeDoll: 1 },
      itemActivation: { pokeDoll: true },
      dex: [{ id: 'owned', baseId: 1, finalId: 3, chainOrder: [1, 2, 3] }],
    },
  });
  assert.equal(game.hatch(), false);
  assert.equal(game.state.eggUsage, BALANCE.eggHatch);
  assert.equal(game.state.eggBlockedReason, 'no-new-pokemon');
  assert.equal(game.toggleItem('pokeDoll'), true);
  assert.equal(game.state.active.baseId, 1);
  assert.equal(game.state.eggBlockedReason, null);
});

test('blocked egg state is exposed through the sanitized snapshot and Docker UI', () => {
  const snapshot = sanitizeSnapshot({
    mode: 'docker-local',
    state: { eggBlockedReason: 'no-new-pokemon' },
    egg: { progress: 1, remaining: 0, tier: 'common', blockedReason: 'no-new-pokemon' },
  });
  assert.equal(snapshot.egg.blockedReason, 'no-new-pokemon');
  const app = fs.readFileSync(path.join(root, 'web', 'app.js'), 'utf8');
  const html = fs.readFileSync(path.join(root, 'web', 'index.html'), 'utf8');
  assert.match(app, /noNewPokemon/);
  assert.match(html, /progress-feedback/);
  assert.equal(typeof catalog.translate, 'function');
  for (const language of ['en', 'it', 'ko', 'ja', 'es', 'fr', 'pt'])
    assert.equal(typeof catalog.translate('noNewPokemon', language), 'string');
});

test('item purchases and toggles show feedback only on the interacted object', () => {
  const app = fs.readFileSync(path.join(root, 'web', 'app.js'), 'utf8');
  const html = fs.readFileSync(path.join(root, 'web', 'index.html'), 'utf8');
  assert.match(app, /actionFeedback/);
  assert.match(app, /actionItemTitle/);
  assert.match(app, /purchaseInProgress/);
  assert.match(app, /purchaseCompleted/);
  assert.match(app, /itemUpdating/);
  assert.match(app, /itemActivated/);
  assert.match(app, /itemDeactivated/);
  assert.match(app, /item-feedback/);
  assert.match(app, /text\('#progress-feedback', ''\);/);
  assert.match(app, /else showActionFeedback\('actionFailed', itemTitle\);/);
  assert.match(app, /!silent && !visualAction/);
  assert.match(app, /model\.actionPending \|\| model\.actionFeedback/);
  assert.match(app, /model\.config = await request\('\/api\/config'\);[\s\S]*model\.config = \{\};/);
  assert.match(html, /item-feedback/);
  const italian = catalog.translate('purchaseInProgress', 'it', { item: 'Poké Doll' });
  assert.match(italian, /Poké Doll/);
  assert.doesNotMatch(italian, /companion/);
  for (const language of ['en', 'it', 'ko', 'ja', 'es', 'fr', 'pt']) {
    assert.equal(typeof catalog.translate('purchaseInProgress', language, { item: 'Poké Doll' }), 'string');
    assert.equal(typeof catalog.translate('purchaseCompleted', language, { item: 'Poké Doll' }), 'string');
    assert.equal(typeof catalog.translate('itemUpdating', language, { item: 'Poké Doll' }), 'string');
    assert.equal(typeof catalog.translate('itemActivated', language, { item: 'Poké Doll' }), 'string');
    assert.equal(typeof catalog.translate('itemDeactivated', language, { item: 'Poké Doll' }), 'string');
  }
});

test('shop keeps the owned Poke Doll visible and uses the supplied Mint PNG', () => {
  const app = fs.readFileSync(path.join(root, 'web', 'app.js'), 'utf8');
  assert.match(app, /assets\/items\/mint\.png/);
  assert.match(app, /item\.kind !== 'shinyCharm'/);
  assert.equal(fs.existsSync(path.join(root, 'assets', 'items', 'mint.png')), true);
  const mintShopStart = app.indexOf("{ kind: 'mint',");
  const mintShopEnd = app.indexOf('price:', mintShopStart);
  assert.ok(mintShopStart >= 0 && mintShopEnd > mintShopStart);
  assert.ok(app.slice(mintShopStart, mintShopEnd).includes("image: 'assets/items/mint.png'"));
});

test('Pokédex rendering uses the sanitized collection name field', () => {
  const snapshot = sanitizeSnapshot({
    mode: 'public-readonly',
    collection: {
      pokedex: [{ id: 25, name: 'Pikachu', shiny: false, isRaising: false, rarity: 'common' }],
      catchLog: [],
    },
  });
  assert.equal(snapshot.collection.pokedex[0].name, 'Pikachu');
  const app = fs.readFileSync(path.join(root, 'web', 'app.js'), 'utf8');
  const helperStart = app.indexOf('function collectionName(');
  const helperEnd = app.indexOf('function dexSprite(', helperStart);
  assert.ok(helperStart >= 0 && helperEnd > helperStart);
  assert.match(app.slice(helperStart, helperEnd), /entry\?\.name/);
});

test('legacy imports normalize missing dex and settings fields', () => {
  const imported = importedState({ usedSinceInstall: 42 }, [], { catalog: [] });
  assert.ok(imported);
  assert.deepEqual(imported.dex, []);
  assert.equal(imported.settings.language, 'en');
  assert.equal(imported.usedSinceInstall, 42);
});

test('Docker build context excludes writable state and runtime files', () => {
  const ignored = fs.readFileSync(path.join(root, '.dockerignore'), 'utf8');
  for (const entry of ['data/', 'companion-state.json', '*.log', '*.tmp'])
    assert.match(ignored, new RegExp(`^${entry.replace('*', '\\S*')}$`, 'm'));
});

test('inventory normalization floors fractional imported quantities', () => {
  const game = new Game({ state: { inventory: { pokeDoll: 0.6, shinyCharm: 1.6, rareCandy: 2.9 } } });
  assert.equal(game.state.inventory.pokeDoll, 0);
  assert.equal(game.state.inventory.shinyCharm, 1);
  assert.equal(game.state.inventory.rareCandy, 2);
});

test('legacy dex entries reconstruct a usable chain from base and final ids', () => {
  const game = new Game({
    catalog: [catalogEntry(1, [1, 2, 3])],
    rng: () => 0,
    state: {
      eggUsage: BALANCE.eggHatch,
      inventory: { pokeDoll: 1 },
      itemActivation: { pokeDoll: true },
      dex: [{ id: 'legacy', baseId: 1, finalId: 3 }],
    },
  });
  assert.deepEqual(game.state.dex[0].chainOrder, [1, 3]);
  assert.equal(game.hatch(), false);
  assert.equal(game.state.eggBlockedReason, 'no-new-pokemon');
});

test('HTTP actions fail closed when the host allowlist is omitted', async () => {
  let calls = 0;
  const service = {
    getSnapshot: async () => ({ mode: 'web-local' }),
    getCapabilities: () => buildCapabilities({ mode: 'web-local', platform: 'linux', readOnly: false }),
    handleAction: async () => {
      calls += 1;
      return { ok: true };
    },
  };
  const web = createWebServer({
    service,
    host: '0.0.0.0',
    staticRoot: path.join(root, 'web'),
    assetRoot: path.join(root, 'assets'),
  });
  try {
    await web.start();
    const port = web.address().port;
    const response = await fetch(`http://127.0.0.1:${port}/api/action`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ type: 'setting', value: { key: 'language', value: 'it' } }),
    });
    assert.equal(response.status, 403);
    assert.equal(calls, 0);
  } finally {
    await web.close();
  }
});

test('Poke Doll purchase and toggle persist across service reloads', async () => {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'ptd-review-persistence-'));
  const env = {
    PTD_WEB_CONTAINER: '1',
    PTD_WEB_MODE: 'docker-local',
    PTD_WEB_ALLOW_MUTATIONS: '1',
    PTD_BIND_HOST: '127.0.0.1',
    HOME: directory,
  };
  const options = {
    mode: 'docker-local',
    platform: 'linux',
    env,
    stateFile: path.join(directory, 'companion-state.json'),
    catalog: [catalogEntry(1, [1, 2, 3]), catalogEntry(4, [4, 5, 6])],
    state: { usedSinceInstall: 20_000_000_000 },
    hermesReader: async () => emptyUsage(),
    localReader: async () => emptyUsage(),
    scanReader: async () => ({ totalRows: 0, unattributedRows: 0, timeWindowedRows: 0, providers: [] }),
    persist: true,
  };
  try {
    const service = createLocalService(options);
    assert.equal((await service.handleAction('buy', 'pokeDoll')).ok, true);
    assert.equal((await service.handleAction('toggle-item', 'pokeDoll')).ok, true);
    const restored = createLocalService({ ...options, state: undefined });
    assert.equal(restored.game.itemCount('pokeDoll'), 1);
    assert.equal(restored.game.isItemActive('pokeDoll'), false);
  } finally {
    fs.rmSync(directory, { recursive: true, force: true });
  }
});

test('local service no longer exposes the removed pin handler', () => {
  const source = fs.readFileSync(path.join(root, 'core', 'local-service.cjs'), 'utf8');
  assert.doesNotMatch(source, /if \(type === ['\"]pin['\"]\)/);
});

test('public-readonly mode stays read-only despite an explicit writable override', () => {
  const capabilities = buildCapabilities({ mode: 'public-readonly', platform: 'linux', env: {}, readOnly: false });
  assert.equal(capabilities.readOnly, true);
  assert.equal(capabilities.actions, false);
});

test('read-only capabilities deny every mutating action even when actions is inconsistent', () => {
  const capabilities = { snapshot: true, readOnly: true, actions: true };
  for (const type of ['buy', 'candy', 'mint', 'egg', 'setting', 'toggle-item', 'import-save'])
    assert.equal(actionAllowed(capabilities, type), false, type);
});

test('Home renders translated guidance for every supported blocked egg reason', () => {
  const app = fs.readFileSync(path.join(root, 'web', 'app.js'), 'utf8');
  assert.match(app, /noCompatiblePokemon/);
  assert.match(app, /blockedReason/);
  for (const language of ['en', 'it', 'ko', 'ja', 'es', 'fr', 'pt'])
    assert.equal(typeof catalog.translate('noCompatiblePokemon', language), 'string');
});

test('Docker build context excludes release archives', () => {
  const ignored = fs.readFileSync(path.join(root, '.dockerignore'), 'utf8');
  assert.match(ignored, /^\*\.zip$/m);
});

test('all localized README sections document public-readonly as the default', () => {
  const readme = fs.readFileSync(path.join(root, 'README.md'), 'utf8');
  for (const heading of ['🇰🇷 한국어', '🇯🇵 日本語', '🇪🇸 Español', '🇫🇷 Français', '🇵🇹 Português']) {
    const section = readme.slice(readme.indexOf(heading), readme.indexOf('\n## ', readme.indexOf(heading) + heading.length));
    assert.match(section, /public-readonly/);
    assert.doesNotMatch(section, /interactive (?:profile|mode) (?:is )?(?:the )?default|interaktiven Modus|対話モード|대화형 모드|interactivo predeterminado|interactif par défaut|interativo padrão/iu);
  }
});
