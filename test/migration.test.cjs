const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { migrateStateFile, rollbackMigration } = require('../core/migration.cjs');

function stateFixture(overrides = {}) {
  return {
    version: 2,
    usedSinceInstall: 12_345_678,
    spentTokens: 2_500_000,
    eggUsage: 1_250_000,
    eggTier: 'common',
    inventory: { pokeDoll: 2, hatchIncubator: 1, shinyIncense: 1 },
    itemActivation: { pokeDoll: true, hatchIncubator: true, shinyIncense: true },
    active: null,
    dex: [{ id: 'existing', baseId: 1, finalId: 3, chainOrder: [1, 2, 3], rarity: 'rare', shiny: true }],
    collectedFinals: ['1:3'],
    settings: { language: 'it', refreshMinutes: 5 },
    ...overrides,
  };
}

test('migration creates a byte-identical backup and preserves state invariants', () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'ptd-migration-'));
  const source = path.join(root, 'windows-state.json');
  const target = path.join(root, 'docker', 'companion-state.json');
  const backupDir = path.join(root, 'backups');
  const sourceText = JSON.stringify(stateFixture(), null, 2) + '\n';
  fs.writeFileSync(source, sourceText, 'utf8');
  try {
    const result = migrateStateFile(source, target, { backupDir });
    assert.equal(fs.readFileSync(result.backupFile, 'utf8'), sourceText);
    assert.equal(result.sourceSha256, result.backupSha256);
    const migrated = JSON.parse(fs.readFileSync(target, 'utf8'));
    for (const key of ['usedSinceInstall', 'spentTokens', 'eggUsage', 'eggTier', 'inventory', 'itemActivation', 'active', 'collectedFinals'])
      assert.deepEqual(migrated[key], stateFixture()[key], key);
    assert.deepEqual(migrated.dex.map(({ id, baseId, finalId, chainOrder, rarity, shiny }) => ({ id, baseId, finalId, chainOrder, rarity, shiny })), stateFixture().dex, 'dex invariants');
    assert.equal(result.targetSha256.length, 64);
  } finally {
    fs.rmSync(root, { recursive: true, force: true });
  }
});

test('migration preserves armed incubator and incense without consuming them', () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'ptd-migration-'));
  const source = path.join(root, 'windows-state.json');
  const target = path.join(root, 'docker-state.json');
  fs.writeFileSync(source, JSON.stringify(stateFixture(), null, 2), 'utf8');
  try {
    migrateStateFile(source, target, { backupDir: path.join(root, 'backups') });
    const migrated = JSON.parse(fs.readFileSync(target, 'utf8'));
    assert.equal(migrated.inventory.hatchIncubator, 1);
    assert.equal(migrated.inventory.shinyIncense, 1);
    assert.equal(migrated.itemActivation.hatchIncubator, true);
    assert.equal(migrated.itemActivation.shinyIncense, true);
  } finally {
    fs.rmSync(root, { recursive: true, force: true });
  }
});

test('migration fails closed for invalid JSON and does not create a target', () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'ptd-migration-'));
  const source = path.join(root, 'windows-state.json');
  const target = path.join(root, 'docker-state.json');
  fs.writeFileSync(source, '{not-json', 'utf8');
  try {
    assert.throws(() => migrateStateFile(source, target, { backupDir: path.join(root, 'backups') }), /invalid|JSON/i);
    assert.equal(fs.existsSync(target), false);
  } finally {
    fs.rmSync(root, { recursive: true, force: true });
  }
});

test('migration rollback restores the exact backup bytes', () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'ptd-migration-'));
  const source = path.join(root, 'windows-state.json');
  const target = path.join(root, 'docker-state.json');
  fs.writeFileSync(source, JSON.stringify(stateFixture(), null, 2), 'utf8');
  try {
    const result = migrateStateFile(source, target, { backupDir: path.join(root, 'backups') });
    fs.writeFileSync(target, '{"changed":true}', 'utf8');
    rollbackMigration(result.backupFile, target);
    assert.equal(fs.readFileSync(target, 'utf8'), fs.readFileSync(result.backupFile, 'utf8'));
  } finally {
    fs.rmSync(root, { recursive: true, force: true });
  }
});
