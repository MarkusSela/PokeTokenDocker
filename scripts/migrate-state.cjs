#!/usr/bin/env node
const { migrateStateFile, rollbackMigration } = require('../core/migration.cjs');

function option(name) {
  const prefix = `--${name}=`;
  return process.argv.find((value) => value.startsWith(prefix))?.slice(prefix.length);
}

const rollback = option('rollback');
const target = option('target');
if (rollback) {
  if (!target) throw new Error('Usage: node scripts/migrate-state.cjs --rollback=/absolute/backup.json --target=/absolute/state.json');
  const result = rollbackMigration(rollback, target);
  process.stdout.write(JSON.stringify({ ok: true, target: result.targetFile, sha256: result.sha256 }) + '\n');
} else {
  const source = option('source');
  const backupDir = option('backup-dir');
  if (!source || !target) throw new Error('Usage: node scripts/migrate-state.cjs --source=/absolute/windows-state.json --target=/absolute/docker-state.json [--backup-dir=/absolute/backups]');
  const result = migrateStateFile(source, target, { backupDir });
  process.stdout.write(JSON.stringify({
    ok: true,
    source: result.sourceFile,
    target: result.targetFile,
    backup: result.backupFile,
    sourceSha256: result.sourceSha256,
    backupSha256: result.backupSha256,
    targetSha256: result.targetSha256,
  }) + '\n');
}
