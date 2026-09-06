const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const { URL } = require('node:url');
const { actionAllowed } = require('../core/capabilities.cjs');
const {
  sanitizeCapabilities,
  sanitizeExportState,
  sanitizeSnapshot,
} = require('../core/snapshot-contract.cjs');
const { githubProject, githubIssues, githubReleaseApi } = require('./product-config.cjs');

const DEFAULT_MAX_BODY_BYTES = 1024 * 1024;
const MAX_ALLOWED_BODY_BYTES = 1024 * 1024;
const DEFAULT_BODY_TIMEOUT_MS = 10_000;
const WEB_MUTATING_ACTIONS = new Set([
  'buy',
  'candy',
  'mint',
  'egg',
  'setting',
  'setting-live',
  'toggle-item',
  'add-scan-folder',
  'clear-scan-folders',
  'import-save',
]);
const CONTENT_TYPES = Object.freeze({
  '.css': 'text/css; charset=utf-8',
  '.gif': 'image/gif',
  '.html': 'text/html; charset=utf-8',
  '.ico': 'image/x-icon',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.webp': 'image/webp',
});


function webActionAllowed(capabilities, type) {
  return (WEB_MUTATING_ACTIONS.has(type) || ['refresh', 'snapshot', 'check-update', 'export-save'].includes(type))
    && actionAllowed(capabilities, type);
}

function jsonHeaders() {
  return {
    'Cache-Control': 'no-store',
    'Content-Type': 'application/json; charset=utf-8',
    'Referrer-Policy': 'no-referrer',
    'X-Content-Type-Options': 'nosniff',
  };
}

function sendJson(response, statusCode, value) {
  const body = JSON.stringify(value);
  response.writeHead(statusCode, {
    ...jsonHeaders(),
    'Content-Length': Buffer.byteLength(body),
  });
  response.end(body);
}

function sendError(response, statusCode, code, message) {
  sendJson(response, statusCode, { error: { code, message } });
}

function boundedBodyLimit(value) {
  const number = Number(value);
  if (!Number.isFinite(number)) return DEFAULT_MAX_BODY_BYTES;
  return Math.max(1, Math.min(MAX_ALLOWED_BODY_BYTES, Math.floor(number)));
}

function readBody(request, maxBytes, timeoutMs = DEFAULT_BODY_TIMEOUT_MS) {
  const advertised = Number(request.headers['content-length']);
  if (Number.isFinite(advertised) && advertised > maxBytes) {
    request.resume();
    return Promise.reject(Object.assign(new Error('Request body too large'), { code: 'BODY_TOO_LARGE' }));
  }
  return new Promise((resolve, reject) => {
    const chunks = [];
    let size = 0;
    let settled = false;
    let timer;
    const cleanup = () => {
      clearTimeout(timer);
      request.off('data', onData);
      request.off('end', onEnd);
      request.off('error', onError);
      request.off('aborted', onAborted);
      request.off('close', onClose);
    };
    const fail = (error) => {
      if (settled) return;
      settled = true;
      cleanup();
      request.resume();
      reject(error);
    };
    const onData = (chunk) => {
      size += chunk.length;
      if (size > maxBytes) {
        fail(Object.assign(new Error('Request body too large'), { code: 'BODY_TOO_LARGE' }));
        return;
      }
      chunks.push(chunk);
    };
    const onEnd = () => {
      if (settled) return;
      settled = true;
      cleanup();
      resolve(Buffer.concat(chunks).toString('utf8'));
    };
    const onError = (error) => fail(error);
    const onAborted = () => fail(Object.assign(new Error('Request aborted'), { code: 'REQUEST_ABORTED' }));
    const onClose = () => {
      if (!settled) onAborted();
    };
    request.on('data', onData);
    request.on('end', onEnd);
    request.on('error', onError);
    request.on('aborted', onAborted);
    request.on('close', onClose);
    timer = setTimeout(() => {
      fail(Object.assign(new Error('Request body timed out'), { code: 'BODY_TIMEOUT' }));
    }, Math.max(1, Number(timeoutMs) || DEFAULT_BODY_TIMEOUT_MS));
    if (typeof timer.unref === 'function') timer.unref();
  });
}

function parseActionBody(body) {
  let value;
  try {
    value = JSON.parse(body || '{}');
  } catch {
    throw Object.assign(new Error('Invalid JSON'), { code: 'INVALID_JSON' });
  }
  if (!value || typeof value !== 'object' || Array.isArray(value))
    throw Object.assign(new Error('Action must be an object'), { code: 'INVALID_ACTION' });
  const type = typeof value.type === 'string' ? value.type.trim() : '';
  if (!type || type.length > 64)
    throw Object.assign(new Error('Action type is invalid'), { code: 'INVALID_ACTION' });
  return { type, value: value.value };
}

function hostName(value) {
  let result = String(value || '').trim().toLowerCase();
  if (result.startsWith('[')) {
    const end = result.indexOf(']');
    if (end > 0) result = result.slice(1, end);
  } else if (result.split(':').length === 2 && /^\d+$/.test(result.split(':').at(-1))) {
    result = result.slice(0, result.lastIndexOf(':'));
  }
  return result;
}

function defaultAllowedHosts(bindHost) {
  return ['127.0.0.1', 'localhost', '::1'].includes(hostName(bindHost))
    ? ['127.0.0.1', 'localhost', '::1']
    : [];
}

function actionRequestError(request, { allowedHosts } = {}) {
  const contentType = String(request.headers['content-type'] || '')
    .split(';', 1)[0]
    .trim()
    .toLowerCase();
  if (contentType !== 'application/json')
    return { statusCode: 415, code: 'UNSUPPORTED_MEDIA_TYPE', message: 'Action requests must use application/json' };

  const fetchSite = String(request.headers['sec-fetch-site'] || '').trim().toLowerCase();
  if (fetchSite === 'cross-site' || fetchSite === 'cross-origin')
    return { statusCode: 403, code: 'CSRF_REJECTED', message: 'Cross-origin action requests are not allowed' };

  const origin = String(request.headers.origin || '').trim();
  const requestHost = String(request.headers.host || '').trim().toLowerCase();
  if (allowedHosts !== undefined) {
    const configured = allowedHosts instanceof Set ? allowedHosts : new Set(allowedHosts || []);
    if (![...configured].some((value) => hostName(value) === hostName(requestHost)))
      return { statusCode: 403, code: 'CSRF_REJECTED', message: 'Host is not allowed' };
  }
  if (!origin) return null;
  if (origin === 'null')
    return { statusCode: 403, code: 'CSRF_REJECTED', message: 'Cross-origin action requests are not allowed' };
  let parsedOrigin;
  try {
    parsedOrigin = new URL(origin);
  } catch {
    return { statusCode: 403, code: 'CSRF_REJECTED', message: 'Cross-origin action requests are not allowed' };
  }
  if (
    parsedOrigin.protocol !== 'http:' ||
    parsedOrigin.host.toLowerCase() !== requestHost
  )
    return { statusCode: 403, code: 'CSRF_REJECTED', message: 'Cross-origin action requests are not allowed' };
  return null;
}

function containedPath(root, relativePath) {
  if (!root) return null;
  const absoluteRoot = path.resolve(root);
  const candidate = path.resolve(absoluteRoot, relativePath);
  const relative = path.relative(absoluteRoot, candidate);
  if (!relative || relative.startsWith('..') || path.isAbsolute(relative)) return null;
  if (relative.split(path.sep).some((segment) => segment.startsWith('.'))) return null;
  try {
    const realRoot = fs.realpathSync(absoluteRoot);
    const realCandidate = fs.realpathSync(candidate);
    const realRelative = path.relative(realRoot, realCandidate);
    if (!realRelative || realRelative.startsWith('..') || path.isAbsolute(realRelative)) return null;
    return realCandidate;
  } catch {
    return null;
  }
}

function safeFrameAncestor(value) {
  const candidate = String(value || '').trim();
  if (!candidate) return "'none'";
  try {
    const parsed = new URL(candidate);
    if (!['http:', 'https:'].includes(parsed.protocol) || parsed.origin !== candidate)
      return "'none'";
    return parsed.origin;
  } catch {
    return "'none'";
  }
}

function safeReleaseLink(value, projectUrl, kind) {
  if (!value || !projectUrl) return null;
  try {
    const candidate = new URL(String(value));
    const project = new URL(String(projectUrl));
    if (candidate.protocol !== 'https:' || candidate.hostname !== 'github.com' || candidate.username || candidate.password || candidate.search || candidate.hash)
      return null;
    const base = `${project.pathname.replace(/\/+$/, '')}/releases`;
    if (kind === 'page') {
      if (candidate.pathname !== base && !candidate.pathname.startsWith(`${base}/tag/`)) return null;
    } else if (!candidate.pathname.startsWith(`${base}/download/`)) return null;
    return candidate.toString();
  } catch {
    return null;
  }
}

function safeExportState(value) {
  return sanitizeExportState(value);
}

function staticContentSecurityPolicy(frameAncestor = "'none'") {
  return [
    "default-src 'self'",
    "connect-src 'self'",
    "img-src 'self' https://raw.githubusercontent.com",
    "style-src 'self' 'unsafe-inline'",
    "script-src 'self' 'unsafe-inline'",
    `frame-ancestors ${frameAncestor}`,
    "base-uri 'none'",
  ].join('; ');
}

function serveStatic(response, file, { frameAncestor = "'none'" } = {}) {
  try {
    const stat = fs.statSync(file);
    if (!stat.isFile()) return false;
    const extension = path.extname(file).toLowerCase();
    const headers = {
      'Cache-Control': 'no-store',
      'Content-Length': stat.size,
      'Content-Type': CONTENT_TYPES[extension] || 'application/octet-stream',
      'Content-Security-Policy': staticContentSecurityPolicy(frameAncestor),
      'Referrer-Policy': 'no-referrer',
      'X-Content-Type-Options': 'nosniff',
    };
    response.writeHead(200, headers);
    response.end(fs.readFileSync(file));
    return true;
  } catch {
    return false;
  }
}

function createWebServer({
  service,
  host = '127.0.0.1',
  port = 0,
  staticRoot,
  assetRoot,
  maxBodyBytes = DEFAULT_MAX_BODY_BYTES,
  bodyTimeoutMs = DEFAULT_BODY_TIMEOUT_MS,
  embedOrigin,
  allowedHosts,
  publicConfig = {},
} = {}) {
  if (!service || typeof service.getSnapshot !== 'function' || typeof service.getCapabilities !== 'function')
    throw new TypeError('A snapshot service is required');

  const clients = new Set();
  const activityCounts = new Map();
  const effectiveAllowedHosts = allowedHosts === undefined
    ? defaultAllowedHosts(host)
    : allowedHosts;
  const bodyLimit = boundedBodyLimit(maxBodyBytes);
  const frameAncestor = safeFrameAncestor(embedOrigin);
  const projectUrl = githubProject(publicConfig.projectUrl);
  const safeConfig = {
    projectUrl,
    issuesUrl: projectUrl ? githubIssues(publicConfig.issuesUrl, projectUrl) : null,
    releaseUrl: projectUrl ? githubReleaseApi(publicConfig.releaseUrl, projectUrl) : null,
  };
  let listening = false;

  async function snapshot() {
    return sanitizeSnapshot(await service.getSnapshot());
  }

  function capabilities() {
    return sanitizeCapabilities(service.getCapabilities());
  }

  function actionResult(value) {
    const source = value && typeof value === 'object' && !Array.isArray(value) ? value : {};
    const result = { ok: Boolean(source.ok) };
    if (source.snapshot) result.snapshot = sanitizeSnapshot(source.snapshot);
    if (source.save && typeof source.save === 'object' && !Array.isArray(source.save)) {
      result.save = safeExportState(source.save);
    }
    if (source.update && typeof source.update === 'object') {
      result.update = {
        ok: Boolean(source.update.ok),
        currentVersion: String(source.update.currentVersion || '').slice(0, 32),
        latestVersion: String(source.update.latestVersion || '').slice(0, 32),
        updateAvailable: Boolean(source.update.updateAvailable),
        windowsReleaseAvailable: Boolean(source.update.windowsReleaseAvailable),
        url: safeReleaseLink(source.update.url, safeConfig.projectUrl, 'page'),
        assetUrl: safeReleaseLink(source.update.assetUrl, safeConfig.projectUrl, 'asset'),
      };
    }
    if (source.error) result.error = { code: 'ACTION_FAILED', message: 'Action failed' };
    return result;
  }

  function publishEvent(eventName, value) {
    const message = `event: ${eventName}\ndata: ${JSON.stringify(value)}\n\n`;
    for (const client of clients) {
      if (!client.ready) {
        client.pending.push(message);
        continue;
      }
      try {
        client.response.write(message);
      } catch {
        clients.delete(client);
      }
    }
  }

  function publishSnapshot(value) {
    publishEvent('snapshot', sanitizeSnapshot(value));
  }

  function publishActivity(value) {
    const source = value && typeof value === 'object' ? value : {};
    const type = String(source.type || 'activity');
    const current = activityCounts.get(type) || 0;
    const next = source.pending === false
      ? Math.max(0, current - 1)
      : source.pending === true
        ? current + 1
        : current;
    activityCounts.set(type, next);
    publishEvent('activity', { ...source, type, pending: next > 0 });
  }

  async function route(request, response) {
    const parsed = new URL(request.url || '/', `http://${request.headers.host || 'localhost'}`);
    const pathname = parsed.pathname;

    if (request.method === 'GET' && pathname === '/healthz') {
      return sendJson(response, 200, {
        ok: true,
        service: 'poketokendocker',
        mode: capabilities().mode || 'unknown',
      });
    }
    if (request.method === 'GET' && pathname === '/api/capabilities')
      return sendJson(response, 200, capabilities());
    if (request.method === 'GET' && pathname === '/api/config')
      return sendJson(response, 200, {
        product: 'PokeTokenDocker',
        projectUrl: safeConfig.projectUrl,
        issuesUrl: safeConfig.issuesUrl,
        releaseUrl: safeConfig.releaseUrl,
      });
    if (request.method === 'GET' && pathname === '/api/snapshot')
      return sendJson(response, 200, await snapshot());
    if (request.method === 'GET' && pathname === '/api/events') {
      response.writeHead(200, {
        'Cache-Control': 'no-store',
        'Connection': 'keep-alive',
        'Content-Type': 'text/event-stream; charset=utf-8',
        'X-Accel-Buffering': 'no',
        'X-Content-Type-Options': 'nosniff',
      });
      response.write('retry: 5000\n\n');
      const client = { response, ready: false, pending: [] };
      clients.add(client);
      const removeClient = () => clients.delete(client);
      request.on('close', removeClient);
      response.on('close', removeClient);
      try {
        if (!clients.has(client)) return;
        response.write(`event: snapshot\ndata: ${JSON.stringify(await snapshot())}\n\n`);
        client.ready = true;
        for (const message of client.pending) response.write(message);
        client.pending = [];
      } catch {
        clients.delete(client);
        response.destroy();
      }
      return;
    }
    if (request.method === 'POST' && pathname === '/api/action') {
      const requestError = actionRequestError(request, { allowedHosts: effectiveAllowedHosts });
      if (requestError) {
        request.resume();
        return sendError(response, requestError.statusCode, requestError.code, requestError.message);
      }
      let action;
      try {
        action = parseActionBody(await readBody(request, bodyLimit, bodyTimeoutMs));
      } catch (error) {
        if (error.code === 'BODY_TOO_LARGE') return sendError(response, 413, error.code, 'Request body too large');
        if (error.code === 'BODY_TIMEOUT') return sendError(response, 408, error.code, 'Request body timed out');
        if (error.code === 'REQUEST_ABORTED') return sendError(response, 400, error.code, 'Request aborted');
        if (error.code === 'INVALID_JSON') return sendError(response, 400, error.code, 'Invalid JSON');
        return sendError(response, 400, error.code || 'INVALID_ACTION', 'Invalid action');
      }
      if (!webActionAllowed(capabilities(), action.type))
        return sendError(response, 403, 'ACTION_NOT_ALLOWED', 'Action is not allowed');
      if (typeof service.handleAction !== 'function')
        return sendError(response, 501, 'ACTIONS_UNAVAILABLE', 'Actions are unavailable');
      const candyAction = action.type === 'candy';
      if (candyAction) publishActivity({ type: 'candy', pending: true });
      try {
        const result = await service.handleAction(action.type, action.value);
        const safeResult = actionResult(result);
        if (safeResult.snapshot) publishSnapshot(safeResult.snapshot);
        return sendJson(response, 200, safeResult);
      } catch {
        return sendError(response, 500, 'ACTION_FAILED', 'Action failed');
      } finally {
        if (candyAction) publishActivity({ type: 'candy', pending: false });
      }
    }

    if (request.method === 'GET' || request.method === 'HEAD') {
      let file = null;
      if (pathname === '/' || pathname === '/index.html') {
        file = containedPath(staticRoot, 'index.html');
      } else if (pathname.startsWith('/assets/')) {
        let relative;
        try {
          relative = decodeURIComponent(pathname.slice('/assets/'.length));
        } catch {
          relative = null;
        }
        file = relative == null ? null : containedPath(assetRoot, relative);
      } else {
        let relative;
        try {
          relative = decodeURIComponent(pathname.replace(/^\//, ''));
        } catch {
          relative = null;
        }
        file = relative == null ? null : containedPath(staticRoot, relative);
      }
      if (file && request.method === 'HEAD') {
        try {
          const stat = fs.statSync(file);
          response.writeHead(200, {
            ...jsonHeaders(),
            'Content-Length': stat.size,
            'Content-Type': CONTENT_TYPES[path.extname(file).toLowerCase()] || 'application/octet-stream',
          });
          return response.end();
        } catch {}
      }
      if (file && serveStatic(response, file, {
        frameAncestor: path.basename(file) === 'mini.html' ? frameAncestor : "'none'",
      })) return;
    }

    if (request.method !== 'GET' && request.method !== 'HEAD' && pathname.startsWith('/api/'))
      return sendError(response, 405, 'METHOD_NOT_ALLOWED', 'Method not allowed');
    return sendError(response, 404, 'NOT_FOUND', 'Not found');
  }

  const server = http.createServer((request, response) => {
    route(request, response).catch(() => {
      if (!response.headersSent) sendError(response, 500, 'INTERNAL_ERROR', 'Internal server error');
      else response.destroy();
    });
  });
  server.headersTimeout = 10_000;
  server.requestTimeout = 0;

  return {
    server,
    address: () => server.address(),
    start() {
      if (listening) return Promise.resolve(server.address());
      return new Promise((resolve, reject) => {
        const onError = (error) => {
          server.off('listening', onListening);
          reject(error);
        };
        const onListening = () => {
          server.off('error', onError);
          listening = true;
          resolve(server.address());
        };
        server.once('error', onError);
        server.once('listening', onListening);
        server.listen(port, host);
      });
    },
    publishSnapshot,
    publishActivity,
    async close() {
      for (const client of clients) client.response.end();
      clients.clear();
      if (!listening) return;
      await new Promise((resolve) => server.close(() => resolve()));
      listening = false;
    },
  };
}

module.exports = { actionRequestError, createWebServer };
