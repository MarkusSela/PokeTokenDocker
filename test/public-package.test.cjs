const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.join(__dirname, '..');

function read(name) {
  const file = path.join(root, name);
  return fs.existsSync(file) ? fs.readFileSync(file, 'utf8') : '';
}

test('public package has a safe ignore policy for local state and release archives', () => {
  const gitignore = read('.gitignore');
  assert.ok(gitignore, '.gitignore must exist before a repository is created');
  for (const entry of ['node_modules/', '.env', '.env.*', 'data/', 'state/', '*.db', '*.db-wal', '*.db-shm', '*.zip', 'dist/', 'coverage/'])
    assert.match(gitignore, new RegExp(`^${entry.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'm'));
});

test('README documents the shipped Mini view and only real API routes', () => {
  const readme = read('README.md');
  assert.match(readme, /mini\.html/);
  assert.match(readme, /PTD_EMBED_ORIGIN/);
  assert.match(readme, /\/api\/capabilities/);
  assert.match(readme, /\/api\/snapshot/);
  assert.match(readme, /\/api\/events/);
  assert.doesNotMatch(readme, /verify[^\n]*\/api\/config/i);
  assert.doesNotMatch(readme, /C:\\Users\\|192\.168\.1\.16|Bearer\s+[A-Za-z0-9._-]+/i);
});

test('screenshot documentation names every bundled image and keeps the Mini separate', () => {
  const docs = read('docs/SCREENSHOTS.md');
  for (const image of ['home.png', 'homepage.png', 'settings.png']) {
    assert.ok(fs.existsSync(path.join(root, 'docs', 'images', image)), `${image} must exist`);
    assert.match(docs, new RegExp(image.replace('.', '\\.'), 'i'));
  }
  assert.match(docs, /mini\.html/);
  assert.match(docs, /synthetic|fixture/i);
});

test('release metadata keeps the Docker identity and credential-free update model', () => {
  const pkg = JSON.parse(read('package.json'));
  assert.equal(pkg.name, 'poketokendocker');
  assert.equal(pkg.private, true);
  assert.equal(pkg.repository.url, 'https://github.com/MarkusSela/PokeTokenDocker.git');
  assert.equal(pkg.bugs.url, 'https://github.com/MarkusSela/PokeTokenDocker/issues');
  assert.match(read('SECURITY.md'), /credential|token/i);
});
