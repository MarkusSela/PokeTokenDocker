const path = require('node:path');
const { createLocalService } = require('../core/local-service.cjs');
const { createWebServer } = require('./http-server.cjs');
const { resolveCompanionStateFilePath } = require('../core/platform-paths.cjs');
const { loadShippedCatalog } = require('../core/pokeapi.cjs');
const { checkLatestRelease } = require('../core/release-check.cjs');
const { resolveProductConfig } = require('./product-config.cjs');
const { dockerMutationsAllowed } = require('../core/capabilities.cjs');
const { version: packageVersion } = require('../package.json');

const ROOT = path.join(__dirname, '..');
const LOCAL_HOSTS = new Set(['127.0.0.1', 'localhost', '::1']);

function normalizeHost(value) {
  const text = String(value || '').trim().toLowerCase();
  if (text.startsWith('[') && text.includes(']')) return text.slice(1, text.indexOf(']'));
  if (text.split(':').length === 2 && /^\d+$/.test(text.slice(text.lastIndexOf(':') + 1)))
    return text.slice(0, text.lastIndexOf(':'));
  return text;
}

function configuredHost(env = process.env) {
  const requested = normalizeHost(env.PTD_WEB_HOST || '127.0.0.1');
  if (LOCAL_HOSTS.has(requested)) return requested;
  if (requested === '0.0.0.0' && env.PTD_WEB_CONTAINER === '1') return requested;
  throw new Error('Web server host must remain local');
}

function configuredPort(env = process.env) {
  const value = Number(env.PTD_WEB_PORT || 4317);
  if (!Number.isInteger(value) || value < 0 || value > 65_535) throw new Error('Invalid web server port');
  return value;
}

function configuredMode(env = process.env) {
  const requested = ['web-local', 'docker-local', 'public-readonly'].includes(env.PTD_WEB_MODE)
    ? env.PTD_WEB_MODE
    : 'web-local';
  if (requested === 'docker-local' && !dockerMutationsAllowed(env)) return 'public-readonly';
  if (env.PTD_WEB_CONTAINER === '1' && requested !== 'docker-local') return 'public-readonly';
  return requested;
}

function parseAllowedHosts(value = '') {
  return new Set(
    String(value)
      .split(',')
      .map(normalizeHost)
      .filter(Boolean),
  );
}

function allowedHostsForEnvironment(env = process.env) {
  const result = parseAllowedHosts(env.PTD_ALLOWED_HOSTS || '127.0.0.1,localhost,::1');
  const bindHost = normalizeHost(env.PTD_BIND_HOST || '127.0.0.1');
  if (bindHost && !['0.0.0.0', '::'].includes(bindHost)) result.add(bindHost);
  return result;
}

function formatBoundHost(host) {
  const value = String(host || '').trim();
  return value.includes(':') && !value.startsWith('[') ? `[${value}]` : value;
}

async function startWebServer({ env = process.env } = {}) {
  const mode = configuredMode(env);
  const productConfig = resolveProductConfig(env);
  const service = createLocalService({
    mode,
    platform: process.platform,
    env,
    readOnly: mode === 'public-readonly',
    stateFile: resolveCompanionStateFilePath({ platform: process.platform, env }),
    persist: mode !== 'public-readonly',
    catalog: loadShippedCatalog(),
    releaseChecker: () => checkLatestRelease({
      currentVersion: packageVersion,
      releaseUrl: productConfig.releaseUrl,
      userAgent: 'PokeTokenDocker',
    }),
  });
  const server = createWebServer({
    service,
    host: configuredHost(env),
    port: configuredPort(env),
    staticRoot: path.join(ROOT, 'web'),
    assetRoot: path.join(ROOT, 'assets'),
    embedOrigin: env.PTD_EMBED_ORIGIN,
    allowedHosts: allowedHostsForEnvironment(env),
    publicConfig: productConfig,
  });
  await service.refresh();
  const address = await server.start();
  const boundHost = formatBoundHost(address.address);
  process.stdout.write(`PokeTokenDocker web listening on http://${boundHost}:${address.port}\n`);
  let stopping = null;
  const stop = async () => {
    if (stopping) return stopping;
    stopping = server.close();
    await stopping;
  };
  process.once('SIGINT', () => { stop().finally(() => process.exit(0)); });
  process.once('SIGTERM', () => { stop().finally(() => process.exit(0)); });
  return { service, server, stop };
}

if (require.main === module) {
  startWebServer().catch(() => {
    process.stderr.write('PokeTokenDocker web server failed to start\n');
    process.exitCode = 1;
  });
}

module.exports = {
  startWebServer,
  configuredHost,
  configuredPort,
  configuredMode,
  formatBoundHost,
  parseAllowedHosts,
  allowedHostsForEnvironment,
};
