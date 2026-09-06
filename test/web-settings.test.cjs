const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { createLocalService } = require('../core/local-service.cjs');

function emptyUsage() {
  return {
    date: '2026-09-02',
    today: {}, week: {}, month: {}, block5h: {},
    providers: [], todayProviders: [], progressionRows: [],
    officialAvailable: false, limitWindows: [],
  };
}

function makeService() {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'ptb-web-settings-'));
  const service = createLocalService({
    mode: 'web-local',
    platform: 'linux',
    env: { HOME: directory },
    stateFile: path.join(directory, 'companion-state.json'),
    state: { usedSinceInstall: 120, spentTokens: 20 },
    hermesReader: async () => emptyUsage(),
    localReader: async () => emptyUsage(),
    scanReader: async () => ({ totalRows: 0, unattributedRows: 0, timeWindowedRows: 0, providers: [] }),
    releaseChecker: async () => ({
      ok: true,
      currentVersion: '0.1.0',
      latestVersion: '0.2.0',
      updateAvailable: true,
      windowsReleaseAvailable: true,
      url: 'https://github.com/MarkusSela/PokeTokenDocker/releases/tag/v0.2.0',
    }),
    persist: false,
  });
  return { service, directory };
}

test('web settings accept the complete Windows toggle set and persist the choice in state', async () => {
  const { service, directory } = makeService();
  try {
    for (const [key, value] of [
      ['launchAtLogin', true], ['menuTodayCost', true], ['updateNotifications', false],
      ['providerStatus', false],
      ['keychainOptOut', true],
    ]) {
      const result = await service.handleAction('setting', { key, value });
      assert.equal(result.ok, true, key);
      assert.equal(service.game.state.settings[key], value, key);
    }
    assert.equal(service.game.state.settings.launchAtLogin, true);
    assert.equal(fs.existsSync(path.join(directory, 'companion-state.json')), false);
  } finally {
    fs.rmSync(directory, { recursive: true, force: true });
  }
});

test('Docker web settings reject desktop-only floating and notification controls', async () => {
  const { service, directory } = makeService();
  try {
    for (const key of [
      'showFloatingPet', 'floatingPetSize', 'notificationsBubbles', 'limitAlerts',
      'warningPercent', 'criticalPercent', 'companionEvents',
    ]) {
      const before = service.game.state.settings[key];
      const result = await service.handleAction('setting', { key, value: true });
      assert.equal(result.ok, false, key);
      assert.equal(service.game.state.settings[key], before, key);
    }
  } finally {
    fs.rmSync(directory, { recursive: true, force: true });
  }
});

test('web scan-folder controls add and clear folders without exposing paths in the snapshot', async () => {
  const { service, directory } = makeService();
  try {
    const added = await service.handleAction('add-scan-folder', { folder: '/var/lib/hermes-usage' });
    assert.equal(added.ok, true);
    assert.deepEqual(service.game.state.settings.additionalScanFolders, ['/var/lib/hermes-usage']);
    assert.equal(added.snapshot.settings.additionalScanFolderCount, 1);
    assert.equal(JSON.stringify(added.snapshot).includes('/var/lib/hermes-usage'), false);

    const cleared = await service.handleAction('clear-scan-folders');
    assert.equal(cleared.ok, true);
    assert.deepEqual(service.game.state.settings.additionalScanFolders, []);
    assert.equal(cleared.snapshot.settings.additionalScanFolderCount, 0);
  } finally {
    fs.rmSync(directory, { recursive: true, force: true });
  }
});

test('web backup and update actions return safe data and a real release result', async () => {
  const { service, directory } = makeService();
  try {
    const exported = await service.handleAction('export-save');
    assert.equal(exported.ok, true);
    assert.equal(typeof exported.save, 'object');
    assert.equal(exported.save.usedSinceInstall, 120);
    assert.equal('additionalScanFolders' in exported.save.settings, false);

    const update = await service.handleAction('check-update');
    assert.equal(update.ok, true);
    assert.equal(update.update.updateAvailable, true);
    assert.equal(update.update.latestVersion, '0.2.0');

    const imported = await service.handleAction('import-save', {
      ...exported.save,
      usedSinceInstall: 240,
      settings: { ...exported.save.settings, refreshMinutes: 5 },
    });
    assert.equal(imported.ok, true);
    assert.equal(service.game.state.usedSinceInstall, 240);
    assert.equal(service.game.state.settings.refreshMinutes, 5);
  } finally {
    fs.rmSync(directory, { recursive: true, force: true });
  }
});

test('web save import normalizes malformed state before replacing the companion state', async () => {
  const { service, directory } = makeService();
  try {
    const result = await service.handleAction('import-save', {
      version: 2,
      settings: { refreshMinutes: 'not-a-number' },
      dex: [],
      inventory: null,
      claimedUsageByRow: null,
      claimedUsageMetricsByRow: null,
    });
    assert.equal(result.ok, true);
    assert.deepEqual(service.game.state.inventory, {});
    assert.deepEqual(service.game.state.claimedUsageByRow, {});
    assert.equal(service.game.state.settings.refreshMinutes, 1);
  } finally {
    fs.rmSync(directory, { recursive: true, force: true });
  }
});
