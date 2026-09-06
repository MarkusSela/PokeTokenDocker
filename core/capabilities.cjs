const MUTATING_ACTIONS = Object.freeze([
  'buy',
  'candy',
  'mint',
  'egg',
  'setting',
  'setting-live',
  'toggle-item',
  'grant-one-time',
  'add-scan-folder',
  'clear-scan-folders',
  'import-save',
]);

const READ_ACTIONS = new Set(['snapshot', 'refresh', 'check-update', 'export-save']);
const MUTATING_ACTION_SET = new Set(MUTATING_ACTIONS);
const LOCAL_BIND_HOSTS = new Set(['127.0.0.1', 'localhost', '::1']);

function normalized(value) {
  return String(value || '').trim().toLowerCase();
}

function booleanValue(value, fallback = false) {
  if (typeof value === 'boolean') return value;
  const text = normalized(value);
  if (['1', 'true', 'yes', 'on'].includes(text)) return true;
  if (['0', 'false', 'no', 'off'].includes(text)) return false;
  return fallback;
}

function detectSession(env = {}) {
  const sessionType = normalized(env.XDG_SESSION_TYPE);
  if (sessionType === 'wayland' || String(env.WAYLAND_DISPLAY || '').trim()) return 'wayland';
  if (sessionType === 'x11' || String(env.DISPLAY || '').trim()) return 'x11';
  return 'unknown';
}

function isDesktopMode(mode) {
  return String(mode || '').startsWith('desktop');
}

function isWebMode(mode) {
  return ['web-local', 'docker-local', 'public-readonly'].includes(mode);
}

function normalizeHost(value) {
  const text = String(value || '').trim().toLowerCase();
  if (text.startsWith('[') && text.includes(']')) return text.slice(1, text.indexOf(']'));
  return text;
}

function dockerMutationsAllowed(env = process.env) {
  if (String(env.PTD_WEB_ALLOW_MUTATIONS || '').trim() !== '1') return false;
  const configuredBind = String(env.PTD_BIND_HOST || '').trim();
  const bindHost = configuredBind
    ? normalizeHost(configuredBind)
    : env.PTD_WEB_CONTAINER === '1'
      ? ''
      : '127.0.0.1';
  return LOCAL_BIND_HOSTS.has(bindHost);
}

function defaultNativeOverlaySupport(platform, session, env) {
  if (platform === 'win32' || platform === 'darwin') return true;
  return platform === 'linux' && session === 'x11' && Boolean(String(env.DISPLAY || '').trim());
}

function buildCapabilities({
  mode = 'desktop-local',
  platform = process.platform,
  env = process.env,
  readOnly,
  trayAvailable,
  notificationAvailable,
  overlayAvailable,
} = {}) {
  const desktop = isDesktopMode(mode);
  const web = isWebMode(mode);
  const session = ['docker-local', 'public-readonly'].includes(mode) ? 'container' : detectSession(env);
  const requestedReadOnly = mode === 'public-readonly'
    ? true
    : readOnly == null
      ? false
      : booleanValue(readOnly);
  const readOnlyMode = requestedReadOnly || (mode === 'docker-local' && !dockerMutationsAllowed(env));
  const nativeOverlay = defaultNativeOverlaySupport(platform, session, env);
  const overlay = desktop && Boolean(
    overlayAvailable == null ? nativeOverlay : overlayAvailable,
  );
  const tray = desktop && Boolean(
    trayAvailable == null
      ? platform !== 'linux' || session === 'x11'
      : trayAvailable,
  );
  const notifications = desktop && Boolean(
    notificationAvailable == null
      ? platform !== 'linux'
      : notificationAvailable,
  );

  return {
    mode,
    platform,
    session,
    readOnly: readOnlyMode,
    home: true,
    snapshot: true,
    actions: !readOnlyMode,
    refresh: true,
    web,
    headless: mode === 'docker-local' || mode === 'public-readonly',
    tray,
    notifications,
    autostart: desktop,
    floatingPet: overlay,

    companionFallback: overlay ? null : 'home',
  };
}

function actionAllowed(capabilities, type) {
  const action = normalized(type);
  if (action === 'export-save' && capabilities?.readOnly) return false;
  if (READ_ACTIONS.has(action)) return Boolean(capabilities?.snapshot);
  if (capabilities?.readOnly) return false;
  return Boolean(capabilities?.actions) && MUTATING_ACTION_SET.has(action);
}

module.exports = {
  MUTATING_ACTIONS,
  READ_ACTIONS,
  detectSession,
  dockerMutationsAllowed,
  buildCapabilities,
  actionAllowed,
};
