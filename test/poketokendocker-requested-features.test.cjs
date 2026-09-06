const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');

const { Game, BALANCE } = require('../core/game.cjs');
const { sanitizeSnapshot } = require('../core/snapshot-contract.cjs');
const { buildCapabilities, actionAllowed } = require('../core/capabilities.cjs');
const { createLocalService } = require('../core/local-service.cjs');
const { configuredMode } = require('../server/cli.cjs');
const catalog = require('../web/i18n.js');

const root = path.join(__dirname, '..');
const app = fs.readFileSync(path.join(root, 'web', 'app.js'), 'utf8');
const html = fs.readFileSync(path.join(root, 'web', 'index.html'), 'utf8');
const compose = fs.readFileSync(path.join(root, 'docker', 'compose.yaml'), 'utf8');
const dockerfile = fs.readFileSync(path.join(root, 'docker', 'Dockerfile'), 'utf8');

function activePokemon() {
  return {
    baseId: 1,
    pathIds: [1],
    plannedPathIds: [1],
    stageIndex: 0,
    usedAtStage: 0,
    rarity: 'common',
    totalForms: 1,
  };
}

function line(baseId, pathIds, rarity = 'common') {
  return {
    baseId,
    pathIds,
    rarity,
    names: Object.fromEntries(pathIds.map((id) => [id, { en: `Pokemon ${id}`, it: `Pokémon ${id}` }])),
  };
}

function catalogEntry(baseId, pathIds, rarity = 'common', captureRate = 200) {
  return { id: baseId, captureRate, line: line(baseId, pathIds, rarity) };
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

test('Docker shop publishes the explicit requested prices', () => {
  assert.equal(BALANCE.freshEgg.price, 1_000_000_000);
  assert.equal(BALANCE.uncommonEgg.price, 2_500_000_000);
  assert.equal(BALANCE.rareEgg.price, 4_000_000_000);
  assert.equal(BALANCE.rareCandy.price, 500_000_000);
  assert.equal(BALANCE.mint.price, 100_000_000);
  assert.equal(BALANCE.shinyCharm.price, 3_000_000_000);
  assert.equal(BALANCE.pokeDoll.price, 8_000_000_000);
});

test('Poke Doll can be bought once and starts enabled', () => {
  const game = new Game({ state: { usedSinceInstall: 20_000_000_000 } });
  assert.equal(game.buyItem('pokeDoll'), true);
  assert.equal(game.state.spentTokens, BALANCE.pokeDoll.price);
  assert.equal(game.itemCount('pokeDoll'), 1);
  assert.equal(game.isItemActive('pokeDoll'), true);
  assert.equal(game.buyItem('pokeDoll'), false);
});

test('Poke Doll prevents hatching a previously collected line while disabled mode permits it', () => {
  const first = catalogEntry(1, [1, 2, 3]);
  const second = catalogEntry(4, [4, 5, 6]);
  const protectedGame = new Game({
    catalog: [first, second],
    rng: () => 0,
    state: {
      inventory: { pokeDoll: 1 },
      itemActivation: { pokeDoll: true },
      collectedFinals: ['1:3'],
    },
  });
  assert.equal(protectedGame.hatch(), true);
  assert.equal(protectedGame.state.active.baseId, 4);

  const disabledGame = new Game({
    catalog: [first, second],
    rng: () => 0,
    state: {
      inventory: { pokeDoll: 1 },
      itemActivation: { pokeDoll: false },
      collectedFinals: ['1:3'],
    },
  });
  assert.equal(disabledGame.hatch(), true);
  assert.equal(disabledGame.state.active.baseId, 1);
});

test('Poke Doll also respects legacy Pokédex entries when the collection ledger is absent', () => {
  const first = catalogEntry(1, [1, 2, 3]);
  const second = catalogEntry(4, [4, 5, 6]);
  const game = new Game({
    catalog: [first, second],
    rng: () => 0,
    state: {
      inventory: { pokeDoll: 1 },
      itemActivation: { pokeDoll: true },
      dex: [{ id: 'legacy', baseId: 1, finalId: 3, chainOrder: [1, 2, 3] }],
    },
  });
  assert.equal(game.hatch(), true);
  assert.equal(game.state.active.baseId, 4);
});

test('Shiny Charm and Poke Doll expose independent activation toggles', () => {
  const game = new Game({
    state: {
      inventory: { shinyCharm: 1, pokeDoll: 1 },
      itemActivation: { shinyCharm: true, pokeDoll: true },
    },
  });
  assert.equal(game.isItemActive('shinyCharm'), true);
  assert.equal(game.toggleItem('shinyCharm'), true);
  assert.equal(game.isItemActive('shinyCharm'), false);
  assert.equal(game.isItemActive('pokeDoll'), true);
  assert.equal(game.toggleItem('pokeDoll'), true);
  assert.equal(game.isItemActive('pokeDoll'), false);
  assert.equal(game.toggleItem('pokeDoll'), true);
  assert.equal(game.isItemActive('pokeDoll'), true);
});

test('Shiny Charm odds follow its activation state', () => {
  const pokemon = catalogEntry(1, [1]);
  const disabled = new Game({
    catalog: [pokemon],
    rng: () => 0.02,
    state: { inventory: { shinyCharm: 1 }, itemActivation: { shinyCharm: false }, eggUsage: BALANCE.eggHatch },
  });
  assert.equal(disabled.hatch(), true);
  assert.equal(disabled.state.active.shiny, false);

  const enabled = new Game({
    catalog: [pokemon],
    rng: () => 0.02,
    state: { inventory: { shinyCharm: 1 }, itemActivation: { shinyCharm: true }, eggUsage: BALANCE.eggHatch },
  });
  assert.equal(enabled.hatch(), true);
  assert.equal(enabled.state.active.shiny, true);
});

test('snapshot keeps item activation and every shop price at the HTTP boundary', () => {
  const snapshot = sanitizeSnapshot({
    mode: 'docker-local',
    readOnly: false,
    capabilities: buildCapabilities({
      mode: 'docker-local',
      platform: 'linux',
      env: {
        PTD_WEB_CONTAINER: '1',
        PTD_WEB_ALLOW_MUTATIONS: '1',
        PTD_BIND_HOST: '127.0.0.1',
      },
      readOnly: false,
    }),
    wallet: 10_000_000_000,
    state: {
      inventory: { pokeDoll: 1, shinyCharm: 1 },
      itemActivation: { pokeDoll: false, shinyCharm: true },
    },
    balance: {
      freshEgg: { price: 1_000_000_000 },
      uncommonEgg: { price: 2_500_000_000 },
      rareEgg: { price: 4_000_000_000 },
      rareCandy: { price: 500_000_000 },
      mint: { price: 100_000_000 },
      shinyCharm: { price: 3_000_000_000 },
      pokeDoll: { price: 8_000_000_000 },
    },
  });
  assert.equal(snapshot.state.itemActivation.pokeDoll, false);
  assert.equal(snapshot.state.itemActivation.shinyCharm, true);
  assert.equal(snapshot.balance.uncommonEgg.price, 2_500_000_000);
  assert.equal(snapshot.balance.rareEgg.price, 4_000_000_000);
  assert.equal(snapshot.balance.pokeDoll.price, 8_000_000_000);
});

test('Docker-local mode enables settings and item actions only with explicit mutation opt-in', async () => {
  const env = {
    PTD_WEB_CONTAINER: '1',
    PTD_WEB_MODE: 'docker-local',
    PTD_WEB_ALLOW_MUTATIONS: '1',
    PTD_BIND_HOST: '127.0.0.1',
  };
  assert.equal(configuredMode(env), 'docker-local');
  const capabilities = buildCapabilities({ mode: 'docker-local', platform: 'linux', env, readOnly: false });
  assert.equal(capabilities.readOnly, false);
  assert.equal(capabilities.actions, true);
  assert.equal(actionAllowed(capabilities, 'toggle-item'), true);

  const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'ptd-docker-local-'));
  try {
    const service = createLocalService({
      mode: 'docker-local',
      platform: 'linux',
      env: {
        HOME: directory,
        PTD_WEB_CONTAINER: '1',
        PTD_WEB_MODE: 'docker-local',
        PTD_WEB_ALLOW_MUTATIONS: '1',
        PTD_BIND_HOST: '127.0.0.1',
      },
      stateFile: path.join(directory, 'companion-state.json'),
      state: { settings: { language: 'en' }, inventory: { shinyCharm: 1 } },
      hermesReader: async () => emptyUsage(),
      localReader: async () => emptyUsage(),
      scanReader: async () => ({ totalRows: 0, unattributedRows: 0, timeWindowedRows: 0, providers: [] }),
      persist: false,
    });
    const changed = await service.handleAction('setting', { key: 'language', value: 'it' });
    assert.equal(changed.ok, true);
    assert.equal(service.game.state.settings.language, 'it');
    const toggled = await service.handleAction('toggle-item', 'shinyCharm');
    assert.equal(toggled.ok, true);
    assert.equal(service.game.isItemActive('shinyCharm'), false);
  } finally {
    fs.rmSync(directory, { recursive: true, force: true });
  }
  assert.equal(configuredMode({ ...env, PTD_WEB_ALLOW_MUTATIONS: '0' }), 'public-readonly');
});

test('Docker package defaults to safe read-only mode and keeps Hermes read-only', () => {
  assert.match(compose, /PTD_WEB_MODE=\$\{PTD_WEB_MODE:-public-readonly\}/);
  assert.match(compose, /PTD_WEB_ALLOW_MUTATIONS=\$\{PTD_WEB_ALLOW_MUTATIONS:-0\}/);
  assert.match(dockerfile, /PTD_WEB_MODE=public-readonly/);
  assert.match(dockerfile, /PTD_WEB_ALLOW_MUTATIONS=0/);
  assert.match(compose, /target: \/hermes[\s\S]*read_only: true/);
});

test('Docker Pokédex removes the non-functional highlight control and representative dead-end', () => {
  assert.doesNotMatch(app, /const pin = element\(/);
  assert.doesNotMatch(app, /sendAction\(['"]pin['"]/);
  assert.doesNotMatch(app, /chooseInPokedex/);
  assert.equal(Object.prototype.hasOwnProperty.call(catalog.messages.en, 'highlight'), false);
  assert.equal(Object.prototype.hasOwnProperty.call(catalog.messages.en, 'unhighlight'), false);
});

test('Docker Home and Pokémon cards use the requested compact visual dimensions', () => {
  assert.match(html, /\.sprite-frame[^}]*width: 120px[^}]*height: 120px/);
  assert.match(html, /\.sprite-frame img[^}]*width: 100%[^}]*height: 100%[^}]*object-fit: contain/);
  assert.match(html, /\.item-emoji[^}]*font-size: 64px[^}]*transform: scale\(1\.45\)/);
  assert.match(html, /\.dex-card\s*\{[^}]*min-height:\s*102px/i);
  assert.match(html, /\.dex-sprite-frame\s*\{[^}]*height:\s*68px/i);
  assert.match(html, /\.dex-card img\s*\{[^}]*width:\s*72px[^}]*height:\s*72px/i);
});

test('Docker UI exposes Poke Doll, item toggles, the supplied WebP asset, and all translations', () => {
  assert.match(app, /pokeDoll/);
  assert.match(app, /toggle-item/);
  assert.match(app, /itemActivation/);
  assert.match(app, /assets\/items\/poke-doll\.webp/);
  assert.equal(fs.existsSync(path.join(root, 'assets', 'items', 'poke-doll.webp')), true);
  const asset = fs.readFileSync(path.join(root, 'assets', 'items', 'poke-doll.webp'));
  assert.equal(asset.subarray(0, 4).toString(), 'RIFF');
  assert.equal(asset.subarray(8, 12).toString(), 'WEBP');
  for (const language of catalog.supportedLanguages) {
    for (const key of ['pokeDoll', 'pokeDollDetail', 'activate', 'deactivate', 'inactive'])
      assert.equal(typeof catalog.messages[language][key], 'string', `${language}.${key}`);
  }
});
