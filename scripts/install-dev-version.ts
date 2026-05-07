import { chmodSync, mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { devBinNames, getDevBinDir, isWindows } from './dev-bin';

const scriptDir = dirname(fileURLToPath(import.meta.url));
const rootDir = resolve(scriptDir, '..');
const binDir = getDevBinDir();

mkdirSync(binDir, { recursive: true });

for (const binName of devBinNames) {
  if (isWindows()) {
    const target = join(binDir, `${binName}.cmd`);
    rmSync(target, { force: true });
    writeFileSync(target, getWindowsShim(binName));
  } else {
    const target = join(binDir, binName);
    rmSync(target, { force: true });
    writeFileSync(target, getPosixShim(binName));
    chmodSync(target, 0o755);
  }
}

function getPosixShim(binName: string) {
  return `#!/usr/bin/env sh
set -eu
export SHEET_CMD_PROG_NAME=${shellQuote(binName)}
exec ${shellQuote(join(rootDir, 'node_modules', '.bin', 'tsx'))} --conditions=development ${shellQuote(join(rootDir, 'src', 'cli.ts'))} "$@"
`;
}

function getWindowsShim(binName: string) {
  return `@echo off
set "SHEET_CMD_PROG_NAME=${binName}"
"${join(rootDir, 'node_modules', '.bin', 'tsx.cmd')}" --conditions=development "${join(rootDir, 'src', 'cli.ts')}" %*
`;
}

function shellQuote(value: string) {
  return `'${value.replaceAll("'", "'\\''")}'`;
}
