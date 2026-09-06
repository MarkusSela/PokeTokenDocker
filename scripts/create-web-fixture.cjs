const fs = require('node:fs');
const path = require('node:path');
const { Game } = require('../core/game.cjs');
const { saveState } = require('../core/state-store.cjs');

const FIXTURE_TOKENS = 50_000_000_000;
const FIXTURE_DEX_COUNT = 20;
const FIXTURE_NOW = new Date('2026-09-02T12:00:00.000Z');
const NATURES = ['Hardy', 'Lonely', 'Brave', 'Adamant', 'Bold', 'Calm', 'Jolly', 'Modest'];

function seededRandom(seed) {
  let value = seed >>> 0;
  return () => {
    value = (value * 1_664_525 + 1_013_904_223) >>> 0;
    return value / 0x1_0000_0000;
  };
}

function catalogPath() {
  return path.join(__dirname, '..', 'assets', 'pokemon-catalog-gen1-5.json');
}

function fixtureCandidates() {
  const rows = JSON.parse(fs.readFileSync(catalogPath(), 'utf8'));
  const seen = new Set();
  return rows.filter((row) => {
    const line = row?.line;
    const ids = Array.isArray(line?.pathIds) ? line.pathIds : [];
    if (!Number.isInteger(row?.id) || seen.has(row.id) || ids.length < 2) return false;
    if (ids[0] !== row.id || ids.some((id) => !Number.isInteger(id))) return false;
    seen.add(row.id);
    return true;
  });
}

function shuffled(rows, rng) {
  const copy = [...rows];
  for (let index = copy.length - 1; index > 0; index -= 1) {
    const swap = Math.floor(rng() * (index + 1));
    [copy[index], copy[swap]] = [copy[swap], copy[index]];
  }
  return copy;
}

function activeFrom(row) {
  const line = row.line;
  return {
    baseId: row.id,
    pathIds: [line.pathIds[0]],
    plannedPathIds: [...line.pathIds],
    stageIndex: 0,
    usedAtStage: 123_456,
    rarity: line.rarity || 'common',
    totalForms: line.pathIds.length,
    shiny: false,
    nature: NATURES[0],
    names: line.names || {},
    dittoDisguise: null,
    dittoRevealed: false,
  };
}

function createWebFixture(file, { count = FIXTURE_DEX_COUNT, seed = 20260902 } = {}) {
  if (!path.isAbsolute(file)) throw new TypeError('Fixture output must be an absolute path');
  if (!Number.isInteger(count) || count < 1 || count > 100) throw new RangeError('Fixture count must be between 1 and 100');
  const candidates = shuffled(fixtureCandidates(), seededRandom(seed));
  if (candidates.length < count + 1) throw new Error('Not enough complete evolutionary lines in catalog');
  const selected = candidates.slice(0, count + 1);
  const dex = selected.slice(0, count).map((row, index) => {
    const line = row.line;
    return {
      id: `fixture-${index + 1}-${row.id}`,
      baseId: row.id,
      finalId: line.pathIds.at(-1),
      chainOrder: [...line.pathIds],
      rarity: line.rarity || 'common',
      caughtAt: new Date(FIXTURE_NOW.getTime() - index * 86_400_000).toISOString(),
      shiny: false,
      nature: NATURES[index % NATURES.length],
      names: line.names || {},
    };
  });
  const game = Game.fresh({ now: () => new Date(FIXTURE_NOW), catalog: candidates });
  game.state.usedSinceInstall = FIXTURE_TOKENS;
  game.state.spentTokens = 0;
  game.state.eggUsage = 0;
  game.state.eggTier = null;
  game.state.active = activeFrom(selected.at(-1));
  game.state.dex = dex;
  game.state.collectedFinals = dex.map((entry) => `${entry.baseId}:${entry.finalId}`);
  game.state.representativeSpeciesId = dex[0].finalId;
  game.state.lastRefreshAt = FIXTURE_NOW.getTime();
  game.state.usageBaselineSet = true;
  game.state.claimedUsageByRow = {};
  game.state.claimedUsageMetricsByRow = {};
  game.state.installBaselineSet = true;
  game.state.lastDate = FIXTURE_NOW.toISOString().slice(0, 10);
  saveState(file, game.state);
  return game.state;
}

if (require.main === module) {
  const output = process.argv.find((value) => value.startsWith('--out='))?.slice('--out='.length);
  if (!output) throw new Error('Usage: node scripts/create-web-fixture.cjs --out=/absolute/path/companion-state.json');
  const state = createWebFixture(output);
  process.stdout.write(JSON.stringify({ file: output, dexCount: state.dex.length, usedSinceInstall: state.usedSinceInstall, activeBaseId: state.active.baseId }) + '\n');
}

module.exports = { createWebFixture, FIXTURE_TOKENS, FIXTURE_DEX_COUNT, fixtureCandidates };
