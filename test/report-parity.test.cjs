const test = require('node:test');
const assert = require('node:assert/strict');
const {
  Game,
  BALANCE,
  eggProgress,
  eggTokensToHatch,
} = require('../core/game.cjs');
const fs = require('node:fs');
const path = require('node:path');

const root = path.join(__dirname, '..');
const appSource = fs.readFileSync(path.join(root, 'web', 'app.js'), 'utf8');
const htmlSource = fs.readFileSync(path.join(root, 'web', 'index.html'), 'utf8');
const settingsSource = fs.readFileSync(path.join(root, 'core', 'settings.cjs'), 'utf8');

function line(id = 1, rarity = 'common') {
  return {
    baseId: id,
    pathIds: [id],
    pathOptions: [[id]],
    rarity,
    names: { [String(id)]: { en: `Species ${id}`, it: `Species ${id}` } },
  };
}

test('Pokédex keeps 24 species per page with a sticky pager contract', () => {
  assert.match(appSource, /COLLECTION_PAGE_SIZE\s*=\s*24/);
  assert.match(appSource, /collectionPage/);
  assert.match(appSource, /filteredEntries\.slice\(/);
  assert.match(appSource, /COLLECTION_PAGE_SIZE/);
  assert.match(appSource, /names\?\.en/);
  assert.doesNotMatch(appSource, /names\?\.\[catalog\.language\(\)\]/);
  assert.match(appSource, /collectionRarity/);
  assert.match(appSource, /collection-rarity/);
  assert.match(htmlSource, /repeat\(4, minmax\(0, 1fr\)\)/);
  assert.match(htmlSource, /collection-pager/);
});

test('Shop exposes the report three-column layout contract', () => {
  assert.match(htmlSource, /shop-items[^>]*shop-grid/);
  assert.match(htmlSource, /\.shop-grid/);
  assert.match(htmlSource, /repeat\(3, minmax\(0, 1fr\)\)/);
});

test('Web companion and Gold walking overlays are browser-configurable', () => {
  assert.match(settingsSource, /spriteStyle:\s*"auto"/);
  assert.match(settingsSource, /showFloatingPet:\s*false/);
  assert.match(settingsSource, /showGoldWalking:\s*false/);
  assert.match(appSource, /renderWebOverlays/);
  assert.match(appSource, /STATIC_AUTO_SPRITES/);
  assert.match(appSource, /spriteStyle/);
  assert.match(htmlSource, /id="companion-overlay"/);
  assert.match(htmlSource, /id="gold-walking-overlay"/);
  for (const asset of [
    'exp-candy-xl-auto.webp', 'exp-candy-xl-pixel.png', 'hatch-incubator-3d.png',
    'shiny-incense-auto.png', 'shiny-incense-pixel.png', 'poke-doll-auto.webp',
    'shiny-charm-auto.png', 'egg-common-auto.png', 'egg-uncommon-auto.png', 'egg-rare-auto.png',
    '../assets/gold-companion-walking.gif',
  ]) {
    const file = asset.startsWith('../') ? path.join(root, 'web', asset) : path.join(root, 'assets', 'items', asset);
    assert.equal(fs.existsSync(file), true, asset);
  }
});

function gameWithItems({ rng = () => 0.9, inventory = {}, activation = {} } = {}) {
  return new Game({
    rng,
    catalog: [{ id: 1, captureRate: 255, line: line() }],
    state: { inventory, itemActivation: activation },
  });
}

test('report economy exposes the Windows v0.2.0 item prices and effects', () => {
  assert.equal(BALANCE.rareCandy.price, 500_000_000);
  assert.equal(BALANCE.mint.price, 100_000_000);
  assert.equal(BALANCE.shinyCharm.price, 3_000_000_000);
  assert.equal(BALANCE.pokeDoll.price, 250_000_000);
  assert.equal(BALANCE.expCandyXL.price, 1_000_000_000);
  assert.equal(BALANCE.hatchIncubator.price, 250_000_000);
  assert.equal(BALANCE.shinyIncense.price, 1_500_000_000);
  assert.equal(BALANCE.expCandyXL.xp, 250_000_000);
  assert.equal(BALANCE.hatchIncubator.threshold, 2_500_000);
  assert.equal(BALANCE.shinyIncense.denominator, 32);
  assert.equal(BALANCE.shinyIncense.combinedDenominator, 24);
});

test('Hatch Incubator changes the engine and snapshot egg threshold', () => {
  const game = gameWithItems({ inventory: { hatchIncubator: 1 }, activation: { hatchIncubator: true } });
  assert.equal(game.eggThreshold(), 2_500_000);
  assert.equal(eggProgress(1_250_000, game.eggThreshold()), 0.5);
  assert.equal(eggTokensToHatch(1_250_000, game.eggThreshold()), 1_250_000);
  game.applyUsage(2_500_000);
  assert.ok(game.state.active, 'egg should hatch at the effective threshold');
  assert.equal(game.itemCount('hatchIncubator'), 0);
  assert.equal(game.isItemActive('hatchIncubator'), false);
});

test('Exp. Candy XL advances active progress and is consumed once', () => {
  const game = gameWithItems({ inventory: { expCandyXL: 1 } });
  game.state.active = {
    baseId: 1, pathIds: [1], plannedPathIds: [1], stageIndex: 0,
    usedAtStage: 0, rarity: 'common', totalForms: 1, shiny: false,
    nature: 'Jolly', names: { '1': { en: 'Species 1', it: 'Species 1' } },
    dittoDisguise: null, dittoRevealed: false,
  };
  assert.equal(game.useExpCandyXL(), true);
  assert.equal(game.state.active.usedAtStage, 250_000_000);
  assert.equal(game.itemCount('expCandyXL'), 0);
});

test('Shiny Incense probability is 1/32 and 1/24 with Shiny Charm', () => {
  const incense = gameWithItems({ rng: () => 0.035, inventory: { shinyIncense: 1 }, activation: { shinyIncense: true } });
  incense.hatchLine(line());
  assert.equal(incense.state.active.shiny, false, '0.035 is above 1/32');

  const combined = gameWithItems({ rng: () => 0.04, inventory: { shinyIncense: 1, shinyCharm: 1 }, activation: { shinyIncense: true, shinyCharm: true } });
  combined.hatchLine(line());
  assert.equal(combined.state.active.shiny, true, '0.04 is below 1/24');
});

test('Hatch Incubator and Shiny Incense are armable and not consumed on a blocked hatch', () => {
  const game = gameWithItems({
    rng: () => 0.9,
    inventory: { hatchIncubator: 1, shinyIncense: 1, pokeDoll: 1 },
    activation: { hatchIncubator: true, shinyIncense: true, pokeDoll: true },
  });
  game.state.collectedFinals = ['1:1'];
  assert.equal(game.hatch(), false);
  assert.equal(game.itemCount('hatchIncubator'), 1);
  assert.equal(game.itemCount('shinyIncense'), 1);
  assert.equal(game.isItemActive('hatchIncubator'), true);
  assert.equal(game.isItemActive('shinyIncense'), true);
});
