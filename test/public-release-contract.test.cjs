const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.join(__dirname, '..');

function read(relativePath) {
  return fs.readFileSync(path.join(root, relativePath), 'utf8');
}

test('Compose defaults to the published image and supports a local override', () => {
  const compose = read('docker/compose.yaml');
  const envExample = read('docker/ptd.env.example');
  assert.match(compose, /image:\s+\$\{PTD_IMAGE:-ghcr\.io\/markussela\/poketokendocker:0\.1\.1\}/);
  assert.doesNotMatch(compose, /docker-poketokendocker:latest/);
  assert.match(envExample, /^PTD_IMAGE=ghcr\.io\/markussela\/poketokendocker:0\.1\.1$/m);
});

test('CI runs the regression suite, release audit, dependency audit, and Docker build', () => {
  const workflow = read('.github/workflows/ci.yml');
  assert.match(workflow, /npm test/);
  assert.match(workflow, /node scripts\/audit-release\.cjs/);
  assert.match(workflow, /npm audit --omit=dev/);
  assert.match(workflow, /docker\/build-push-action/);
  assert.match(workflow, /push:\s*false/);
});

test('tagged release workflow publishes a versioned GHCR image', () => {
  const workflow = read('.github/workflows/release.yml');
  assert.match(workflow, /packages:\s*write/);
  assert.match(workflow, /ghcr\.io\/markussela\/poketokendocker/);
  assert.match(workflow, /docker\/metadata-action/);
  assert.match(workflow, /docker\/build-push-action/);
  assert.match(workflow, /push:\s*true/);
});

test('Docker Hub publication is an explicit manual workflow with secret-based login', () => {
  const workflow = read('.github/workflows/publish-dockerhub.yml');
  assert.match(workflow, /workflow_dispatch/);
  assert.match(workflow, /inputs:/);
  assert.match(workflow, /DOCKERHUB_USERNAME/);
  assert.match(workflow, /DOCKERHUB_TOKEN/);
  assert.match(workflow, /docker\.io\/\$\{\{ inputs\.namespace \}\}\/poketokendocker/);
  assert.match(workflow, /push:\s*true/);
});

test('Dockerfile declares public image metadata and keeps the runtime unprivileged', () => {
  const dockerfile = read('docker/Dockerfile');
  assert.match(dockerfile, /ARG VERSION=0\.1\.1/);
  assert.match(dockerfile, /org\.opencontainers\.image\.source/);
  assert.match(dockerfile, /org\.opencontainers\.image\.version/);
  assert.match(dockerfile, /USER node/);
});

test('README documents pull-first installation and the image override', () => {
  const readme = read('README.md');
  assert.match(readme, /docker compose -f docker\/compose\.yaml pull/);
  assert.match(readme, /PTD_IMAGE/);
  assert.match(readme, /ghcr\.io\/markussela\/poketokendocker:0\.1\.1/);
});

test('public screenshot gallery lists the Homepage card and each feature view', () => {
  const expected = ['home.png', 'homepage.png', 'home-panel.png', 'bag.png', 'shop.png', 'pokedex.png', 'catch-log.png', 'settings.png'];
  const readmes = fs.readdirSync(root)
    .filter((name) => name.startsWith('README') && name.endsWith('.md'))
    .sort();
  for (const file of readmes) {
    const source = read(file);
    const start = source.indexOf('## 📸');
    const end = source.indexOf('\n## ', start + 4);
    assert.ok(start >= 0 && end > start, `${file} must have a bounded screenshot section`);
    const section = source.slice(start, end);
    const images = section.split('src="docs/images/').slice(1).map((chunk) => chunk.split('"')[0]);
    assert.deepEqual(images, expected, `${file} screenshot order`);
    for (const image of expected) assert.equal(fs.existsSync(path.join(root, 'docs', 'images', image)), true, image);
  }
  const policy = read('docs/SCREENSHOTS.md');
  assert.match(policy, /Project-owner-provided compact Homepage card, rebranded to `PokeTokenDocker`/s);
  assert.doesNotMatch(policy, /mini\.png|Homepage Mini view|Real Homepage dashboard capture/i);
  assert.match(policy, /42-card fixture collection.*readable Pokémon name/s);
});
