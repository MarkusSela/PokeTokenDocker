const test = require('node:test');
const assert = require('node:assert/strict');
const { loadShippedCatalog } = require('../core/pokeapi.cjs');
const { Game } = require('../core/game.cjs');

test('shipped catalog covers all 1,025 national-dex species offline', () => {
  const catalog = loadShippedCatalog();
  assert.equal(catalog.length, 1025);
  assert.deepEqual(catalog.map((row) => row.id), Array.from({ length: 1025 }, (_, index) => index + 1));
  for (const row of catalog) {
    assert.equal(typeof row.captureRate, 'number', `capture rate ${row.id}`);
    assert.ok(row.line && row.line.baseId >= 1 && row.line.baseId <= 1025, `line ${row.id}`);
    assert.ok(Array.isArray(row.line.pathIds) && row.line.pathIds.length >= 1, `path ${row.id}`);
    assert.ok(row.line.names?.[String(row.id)]?.en, `English name ${row.id}`);
    assert.match(row.line.names[String(row.id)].en, /\S/);
    assert.ok(['common', 'uncommon', 'rare', 'legendary'].includes(row.line.rarity), `rarity ${row.id}`);
  }
});

test('egg candidate selection deduplicates species from the same evolution line', () => {
  const line = (baseId, rarity = 'common') => ({
    baseId,
    pathIds: [baseId],
    pathOptions: [[baseId]],
    rarity,
    names: { [String(baseId)]: { en: `Species ${baseId}`, it: `Species ${baseId}` } },
  });
  const game = new Game({
    rng: () => 0.8,
    catalog: [
      { id: 1, captureRate: 100, line: line(1) },
      { id: 2, captureRate: 100, line: line(1) },
      { id: 4, captureRate: 45, line: line(4, 'rare') },
    ],
  });
  assert.equal(game.chooseBase().line.baseId, 4);
});
