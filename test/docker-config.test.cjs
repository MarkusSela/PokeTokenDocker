const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.join(__dirname, '..');

function read(name) {
  return fs.readFileSync(path.join(root, name), 'utf8');
}

test('Docker service is headless, non-root, and healthchecked', () => {
  const dockerfile = read('docker/Dockerfile');
  assert.match(dockerfile, /FROM node:22-[^\n]+/);
  assert.match(dockerfile, /USER node/);
  assert.match(dockerfile, /HEALTHCHECK/);
  assert.match(dockerfile, /server\/cli\.cjs/);
  assert.match(dockerfile, /PTD_WEB_MODE=public-readonly/);
  assert.match(dockerfile, /PTD_WEB_ALLOW_MUTATIONS=0/);
  assert.match(dockerfile, /PokeTokenDocker/);
  assert.doesNotMatch(dockerfile, /electron \.|--privileged|--net=host|docker\.sock/);
});

test('Compose keeps the host bind local and Hermes mount read-only', () => {
  const compose = read('docker/compose.yaml');
  const legacyEnv = ['PT', 'B_'].join('');
  assert.match(compose, /\$\{PTD_BIND_HOST:-127\.0\.0\.1\}:4317:4317/);
  assert.match(compose, /PTD_WEB_HOST=0\.0\.0\.0/);
  assert.match(compose, /PTD_WEB_MODE=\$\{PTD_WEB_MODE:-public-readonly\}/);
  assert.match(compose, /PTD_WEB_ALLOW_MUTATIONS=\$\{PTD_WEB_ALLOW_MUTATIONS:-0\}/);
  assert.match(compose, /PTD_ALLOWED_HOSTS=\$\{PTD_ALLOWED_HOSTS:-127\.0\.0\.1,localhost,::1\}/);
  assert.match(compose, /PTD_PROJECT_URL/);
  assert.equal(compose.includes('/data'), true);
  assert.match(compose, /read_only:\s*true/);
  assert.match(compose, /poketokendocker:/);
  assert.match(compose, /image:\s+\$\{PTD_IMAGE:-ghcr\.io\/markussela\/poketokendocker:0\.1\.0\}/);
  assert.doesNotMatch(compose, new RegExp(`privileged:\\s*true|docker\\.sock|\\/home:\\s*\\/root|${legacyEnv}`));
});

test('Compose allows a persistent USB data bind without relying on a new empty volume', () => {
  const compose = read('docker/compose.yaml');
  const legacyVolume = ['poke', 'token', 'bar', '-data:/data'].join('');
  assert.match(compose, /source: \$\{PTD_DATA_DIR:-\.\.\/data\}/);
  assert.doesNotMatch(compose, new RegExp(legacyVolume));
});

test('Docker ignore excludes local state and credentials', () => {
  const ignored = read('.dockerignore');
  for (const entry of ['.env', '*.db', '*.db-wal', '*.db-shm', 'node_modules', 'dist', 'state', 'data/', 'companion-state.json', '*.log'])
    assert.match(ignored, new RegExp(`^${entry.replace('*', '\\S*')}$`, 'm'));
});

test('Docker-only package contains no desktop Electron entrypoint', () => {
  const desktopEntrypoints = ['main', 'preload'].map((name) => `${name}.cjs`);
  for (const entrypoint of desktopEntrypoints)
    assert.equal(fs.existsSync(path.join(root, entrypoint)), false);
  assert.equal(fs.existsSync(path.join(root, 'index.html')), false);
  assert.equal(fs.existsSync(path.join(root, 'floating.html')), false);
  assert.equal(fs.existsSync(path.join(root, 'web', 'mini.html')), true);
});
