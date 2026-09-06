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
  assert.match(compose, /image:\s+\$\{PTD_IMAGE:-ghcr\.io\/markussela\/poketokendocker:0\.1\.0\}/);
  assert.doesNotMatch(compose, /docker-poketokendocker:latest/);
  assert.match(envExample, /^PTD_IMAGE=ghcr\.io\/markussela\/poketokendocker:0\.1\.0$/m);
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
  assert.match(dockerfile, /ARG VERSION=0\.1\.0/);
  assert.match(dockerfile, /org\.opencontainers\.image\.source/);
  assert.match(dockerfile, /org\.opencontainers\.image\.version/);
  assert.match(dockerfile, /USER node/);
});

test('README documents pull-first installation and the image override', () => {
  const readme = read('README.md');
  assert.match(readme, /docker compose -f docker\/compose\.yaml pull/);
  assert.match(readme, /PTD_IMAGE/);
  assert.match(readme, /ghcr\.io\/markussela\/poketokendocker:0\.1\.0/);
});
