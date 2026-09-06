const test = require('node:test');
const assert = require('node:assert/strict');
const { buildCapabilities } = require('../core/capabilities.cjs');

test('public-readonly Docker capabilities identify the container session', () => {
  const capabilities = buildCapabilities({
    mode: 'public-readonly',
    platform: 'linux',
    env: {},
    readOnly: true,
  });
  assert.equal(capabilities.session, 'container');
});
