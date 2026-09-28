const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const { normalizeState } = require('./game.cjs');
const { saveState } = require('./state-store.cjs');

function sha256Bytes(value) {
  return crypto.createHash('sha256').update(value).digest('hex');
}

function sha256File(file) {
  return sha256Bytes(fs.readFileSync(file));
}

function parseSourceState(file, bytes) {
  let value;
  try {
    value = JSON.parse(bytes.toString('utf8'));
  } catch (error) {
    throw new Error(`Invalid JSON source state: ${file}`, { cause: error });
  }
  if (!value || typeof value !== 'object' || Array.isArray(value))
    throw new Error(`Invalid object source state: ${file}`);
  return value;
}

function uniqueBackupPath(backupDir, sourceFile) {
  fs.mkdirSync(backupDir, { recursive: true });
  const base = path.basename(sourceFile, path.extname(sourceFile));
  const suffix = `${Date.now()}-${process.pid}-${crypto.randomBytes(4).toString('hex')}`;
  return path.join(backupDir, `${base}.${suffix}.before-migration${path.extname(sourceFile) || '.json'}`);
}

function migrateStateFile(sourceFile, targetFile, { backupDir } = {}) {
  if (!path.isAbsolute(sourceFile) || !path.isAbsolute(targetFile))
    throw new TypeError('Migration paths must be absolute');
  const sourceBytes = fs.readFileSync(sourceFile);
  const sourceState = parseSourceState(sourceFile, sourceBytes);
  const normalized = normalizeState(sourceState);
  const backupFile = uniqueBackupPath(backupDir || path.join(path.dirname(targetFile), 'backups'), sourceFile);
  fs.copyFileSync(sourceFile, backupFile);
  const sourceSha256 = sha256Bytes(sourceBytes);
  const backupSha256 = sha256File(backupFile);
  if (sourceSha256 !== backupSha256) throw new Error('Migration backup hash mismatch');

  saveState(targetFile, normalized);
  const targetBytes = fs.readFileSync(targetFile);
  const targetState = parseSourceState(targetFile, targetBytes);
  if (targetState.version !== 2) throw new Error('Migrated state schema mismatch');
  return {
    sourceFile,
    targetFile,
    backupFile,
    sourceSha256,
    backupSha256,
    targetSha256: sha256Bytes(targetBytes),
    targetState,
  };
}

function rollbackMigration(backupFile, targetFile) {
  if (!path.isAbsolute(backupFile) || !path.isAbsolute(targetFile))
    throw new TypeError('Rollback paths must be absolute');
  const backupBytes = fs.readFileSync(backupFile);
  parseSourceState(backupFile, backupBytes);
  fs.mkdirSync(path.dirname(targetFile), { recursive: true });
  const pending = `${targetFile}.${process.pid}.${Date.now()}.rollback.tmp`;
  fs.writeFileSync(pending, backupBytes, { mode: 0o600 });
  try {
    fs.renameSync(pending, targetFile);
  } finally {
    try { fs.unlinkSync(pending); } catch {}
  }
  return { targetFile, sha256: sha256Bytes(fs.readFileSync(targetFile)) };
}

module.exports = { migrateStateFile, rollbackMigration, sha256File };
