const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const file = path.join(__dirname, '..', 'web', 'index.html');
const script = path.join(__dirname, '..', 'web', 'app.js');

test('browser Home is self-contained and uses the local API contract', () => {
  const source = `${fs.readFileSync(file, 'utf8')}\n${fs.readFileSync(script, 'utf8')}`;
  assert.match(source, /<title[^>]*data-i18n="pageTitle"[^>]*>\s*PokeTokenDocker Home\s*<\/title>/i);
  assert.match(source, /\/api\/capabilities/);
  assert.match(source, /\/api\/snapshot/);
  assert.match(source, /\/api\/action/);
  assert.match(source, /\/api\/events/);
  assert.match(source, /<script[^>]+src="\/app\.js"[^>]+defer/i);
  assert.match(source, /class="workspace"/);
  assert.match(source, /class="hero-layout"/);
  assert.doesNotMatch(source, /mini-companion/);
  assert.match(source, /id="settings-open"/);
  assert.match(source, /id="settings-overlay"/);
  assert.match(source, /id="settings-content"/);
  assert.match(source, /assets\/items\/rare-candy\.png/);
  assert.match(source, /assets\/items\/shiny-charm\.png/);
  for (const key of [
    'language', 'refreshMinutes', 'limitDisplay', 'launchAtLogin',
    'menuTodayTokens', 'menuTodayCost', 'menuLimitPercent',
    'updateNotifications', 'providerStatus',
    'keychainOptOut', 'additionalScanFolderCount',
  ]) assert.match(source, new RegExp(key));
  assert.match(source, /add-scan-folder/);
  assert.match(source, /clear-scan-folders/);
  assert.match(source, /export-save/);
  assert.match(source, /import-save/);
  assert.match(source, /check-update/);
  assert.match(source, /data-panel="home"/);
  assert.match(source, /data-panel="bag"/);
  assert.match(source, /data-panel="shop"/);
  assert.match(source, /data-panel="pokedex"/);
  assert.match(source, /class="pokedex-scroll"/);
  assert.match(source, /overflow-y:\s*auto/);
  assert.match(source, /readOnly/);
  assert.match(source, /textContent/);
  assert.doesNotMatch(source, /innerHTML\s*=/);
  assert.doesNotMatch(source, /window\.ptb/);
  assert.doesNotMatch(source, /eval\s*\(/);
  assert.doesNotMatch(source, /file:\/\//i);
});

test('Docker Home uses the selected representative only for its sprite', () => {
  const html = fs.readFileSync(file, 'utf8');
  const app = fs.readFileSync(script, 'utf8');
  assert.match(html, /<html\s+lang="en">/i);
  assert.match(app, /snapshot\.representative/);
  assert.match(app, /dexSprite\(\{\s*shiny:\s*snapshot\.representative\.shiny\s*\},\s*snapshot\.representative\.id\)/);
  assert.doesNotMatch(app, /renderFloating|showFloatingPet|floatingPetSize|notificationsBubbles/);
  assert.doesNotMatch(html, /web-floating-preview|PET E ANIMAZIONI WEB|NOTIFICHE/i);
});

test('Docker Home keeps the companion card compact and stretches the workspace', () => {
  const html = fs.readFileSync(file, 'utf8');
  assert.match(html, /\.shell\s*\{[^}]*width:\s*100%[^}]*max-width:\s*none/i);
  assert.match(html, /\.workspace\s*\{[^}]*width:\s*100%/i);
  assert.match(html, /\.hero-block\s*\{[^}]*padding:\s*9px/i);
  assert.match(html, /\.sprite-frame\s*\{[^}]*width:\s*120px[^}]*height:\s*120px/i);
});

test('Docker web UI loads a complete seven-language catalog with English fallback', () => {
  const catalog = require('../web/i18n.js');
  const languages = ['en', 'it', 'ko', 'ja', 'es', 'fr', 'pt'];
  assert.deepEqual(catalog.supportedLanguages, languages);
  const keys = Object.keys(catalog.messages.en).sort();
  assert.ok(keys.length > 50);
  for (const language of languages) {
    assert.deepEqual(Object.keys(catalog.messages[language]).sort(), keys, language);
    for (const key of keys) assert.equal(typeof catalog.messages[language][key], 'string', `${language}.${key}`);
    for (const key of keys) assert.ok(catalog.messages[language][key].trim(), `${language}.${key}`);
  }
  assert.equal(catalog.translate('missing.key', 'xx'), 'missing.key');
  assert.equal(catalog.translate('workspaceTitle', 'xx'), catalog.messages.en.workspaceTitle);
});

test('Docker web UI uses existing catalog keys and changes the document language', () => {
  const catalog = require('../web/i18n.js');
  const app = fs.readFileSync(script, 'utf8');
  const html = fs.readFileSync(file, 'utf8');
  const usedKeys = [...app.matchAll(/\bt\(['"]([^'"]+)['"]/g)].map((match) => match[1]);
  for (const key of usedKeys) assert.ok(catalog.messages.en[key], `missing app key: ${key}`);
  const staticKeys = [...html.matchAll(/data-i18n(?:-aria-label)?="([^"]+)"/g)].map((match) => match[1]);
  for (const key of staticKeys) assert.ok(catalog.messages.en[key], `missing HTML key: ${key}`);

  const textNode = { dataset: { i18n: 'workspaceTitle' }, textContent: 'initial' };
  const root = {
    documentElement: { lang: 'en' },
    querySelectorAll: (selector) => selector === '[data-i18n]' ? [textNode] : [],
  };
  catalog.setLanguage('ja', root);
  assert.equal(root.documentElement.lang, 'ja');
  assert.equal(textNode.textContent, catalog.messages.ja.workspaceTitle);
  catalog.setLanguage('xx', root);
  assert.equal(root.documentElement.lang, 'en');
  assert.equal(textNode.textContent, catalog.messages.en.workspaceTitle);
});

test('Docker web UI routes static and dynamic copy through the catalog', () => {
  const html = fs.readFileSync(file, 'utf8');
  const app = fs.readFileSync(script, 'utf8');
  assert.match(html, /<script src="\/i18n\.js" defer><\/script>/);
  assert.match(html, /data-i18n="workspaceTitle"/);
  assert.match(app, /setLanguage\(settings\(\)\.language\)/);
  assert.match(app, /\bt\(['"]actionFailed['"]/);
  assert.doesNotMatch(app, /Impossibile completare l’azione|Uovo in incubazione|Aggiornato\.|Scegli nel Pokédex/);
});
