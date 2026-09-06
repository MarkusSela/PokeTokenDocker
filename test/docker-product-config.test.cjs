const test = require('node:test');
const assert = require('node:assert/strict');
const { resolveProductConfig, DEFAULT_PROJECT_URL } = require('../server/product-config.cjs');
const fs = require('node:fs');
const path = require('node:path');

const root = path.join(__dirname, '..');

test('PokeTokenDocker uses a safe project configuration by default', () => {
  const config = resolveProductConfig({});
  assert.equal(config.projectUrl, DEFAULT_PROJECT_URL);
  assert.equal(config.issuesUrl, `${DEFAULT_PROJECT_URL}/issues`);
  assert.equal(config.releaseUrl, 'https://api.github.com/repos/MarkusSela/PokeTokenDocker/releases/latest');
  assert.match(config.projectUrl, /^https:\/\/github\.com\//);
  assert.match(config.issuesUrl, /^https:\/\/github\.com\//);
  assert.match(config.releaseUrl, /^https:\/\/api\.github\.com\//);
});

test('PokeTokenDocker accepts explicit HTTPS project links and derives missing endpoints', () => {
  const config = resolveProductConfig({
    PTD_PROJECT_URL: 'https://github.com/example/poketokendocker',
  });
  assert.equal(config.projectUrl, 'https://github.com/example/poketokendocker');
  assert.equal(config.issuesUrl, 'https://github.com/example/poketokendocker/issues');
  assert.equal(config.releaseUrl, 'https://api.github.com/repos/example/poketokendocker/releases/latest');
});

test('PokeTokenDocker rejects unsafe support and release URLs', () => {
  const config = resolveProductConfig({
    PTD_PROJECT_URL: 'http://github.com/example/repo',
    PTD_ISSUES_URL: 'https://evil.example/issues',
    PTD_RELEASE_URL: 'https://api.github.com/repos/example/repo/releases/latest?token=secret',
  });
  assert.equal(config.projectUrl, DEFAULT_PROJECT_URL);
  assert.equal(config.issuesUrl, `${DEFAULT_PROJECT_URL}/issues`);
  assert.equal(config.releaseUrl, 'https://api.github.com/repos/MarkusSela/PokeTokenDocker/releases/latest');
});

test('Docker UI reads support links from its public config endpoint', () => {
  const app = fs.readFileSync(path.join(root, 'web', 'app.js'), 'utf8');
  assert.match(app, /\/api\/config/);
  assert.match(app, /model\.config\?\.projectUrl/);
  assert.match(app, /model\.config\?\.issuesUrl/);
  assert.doesNotMatch(app, /t\('ownedPrice',\s*\{\s*count:\s*t\('ownedCount'/);
  assert.match(app, /PokeTokenDockerI18n/);
});

test('Docker Compose exposes product links through explicit PTD environment variables', () => {
  const compose = fs.readFileSync(path.join(root, 'docker', 'compose.yaml'), 'utf8');
  for (const key of ['PTD_PROJECT_URL', 'PTD_ISSUES_URL', 'PTD_RELEASE_URL'])
    assert.match(compose, new RegExp(key));
});
