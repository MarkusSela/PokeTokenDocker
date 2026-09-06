const { URL } = require('node:url');

const DEFAULT_PROJECT_URL = 'https://github.com/MarkusSela/PokeTokenDocker';

function githubProject(value) {
  try {
    const parsed = new URL(String(value || '').trim());
    if (parsed.protocol !== 'https:' || parsed.hostname !== 'github.com' || parsed.username || parsed.password || parsed.search || parsed.hash)
      return null;
    const pathname = parsed.pathname.replace(/\/+$/, '');
    if (!/^\/[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+$/.test(pathname)) return null;
    return `https://github.com${pathname}`;
  } catch {
    return null;
  }
}

function githubIssues(value, projectUrl) {
  try {
    const parsed = new URL(String(value || '').trim());
    const project = new URL(projectUrl);
    if (parsed.protocol !== 'https:' || parsed.hostname !== 'github.com' || parsed.username || parsed.password || parsed.search || parsed.hash)
      return null;
    if (parsed.pathname.replace(/\/+$/, '') !== `${project.pathname}/issues`) return null;
    return `https://github.com${parsed.pathname.replace(/\/+$/, '')}`;
  } catch {
    return null;
  }
}

function githubReleaseApi(value, projectUrl) {
  try {
    const parsed = new URL(String(value || '').trim());
    const project = new URL(projectUrl);
    if (parsed.protocol !== 'https:' || parsed.hostname !== 'api.github.com' || parsed.username || parsed.password || parsed.search || parsed.hash)
      return null;
    const [owner, repo] = project.pathname.split('/').filter(Boolean);
    const expected = `/repos/${owner}/${repo}/releases/latest`;
    if (parsed.pathname !== expected) return null;
    return `https://api.github.com${expected}`;
  } catch {
    return null;
  }
}

function resolveProductConfig(env = process.env) {
  const projectUrl = githubProject(env.PTD_PROJECT_URL) || DEFAULT_PROJECT_URL;
  const issuesUrl = githubIssues(env.PTD_ISSUES_URL, projectUrl) || `${projectUrl}/issues`;
  const releaseUrl = githubReleaseApi(env.PTD_RELEASE_URL, projectUrl)
    || `https://api.github.com/repos/${new URL(projectUrl).pathname.split('/').filter(Boolean).join('/')}/releases/latest`;
  return Object.freeze({ projectUrl, issuesUrl, releaseUrl });
}

module.exports = {
  DEFAULT_PROJECT_URL,
  resolveProductConfig,
  githubProject,
  githubIssues,
  githubReleaseApi,
};
