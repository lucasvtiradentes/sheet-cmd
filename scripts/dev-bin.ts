import { execFileSync } from 'node:child_process';
import { homedir } from 'node:os';
import { join } from 'node:path';
export const devBinNames = ['gsheetd', 'gsd'];

export function getDevBinDir() {
  if (process.env.SHEET_CMD_DEV_BIN_DIR) return process.env.SHEET_CMD_DEV_BIN_DIR;
  if (isWindows()) return getNpmPrefix() ?? join(homedir(), 'AppData', 'Roaming', 'npm');
  return join(homedir(), '.local', 'bin');
}

export function getNpmExecutable() {
  return isWindows() ? 'npm.cmd' : 'npm';
}

export function isWindows() {
  return process.platform === 'win32';
}

function getNpmPrefix() {
  try {
    return execFileSync(getNpmExecutable(), ['config', 'get', 'prefix'], {
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore']
    }).trim();
  } catch {
    return null;
  }
}
