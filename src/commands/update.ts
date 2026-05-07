import { exec } from 'child_process';
import { readFileSync } from 'fs';
import { platform } from 'os';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import { promisify } from 'util';
import { Logger } from '../utils/logger';
import { reinstallCompletionSilently } from './completion';
import { defineSubCommand } from './define';

const execAsync = promisify(exec);
const __dirname = dirname(fileURLToPath(import.meta.url));

enum PackageManager {
  Npm = 'npm',
  Pnpm = 'pnpm',
  Yarn = 'yarn'
}

const updateCommandsByPackageManager = {
  [PackageManager.Npm]: 'npm update -g sheet-cmd',
  [PackageManager.Pnpm]: 'pnpm update -g sheet-cmd',
  [PackageManager.Yarn]: 'yarn global upgrade sheet-cmd'
} as const satisfies Record<PackageManager, string>;

export const updateCommand = defineSubCommand({
  name: 'update',
  description: 'Update sheet-cmd to latest version',
  errorMessage: 'Failed to check for updates',
  action: async () => {
    Logger.loading('Checking current version...');

    const currentVersion = getCurrentVersion();
    if (!currentVersion) {
      Logger.error('Could not determine current version');
      return;
    }

    Logger.loading('Checking latest version...');

    const latestVersion = await getLatestVersion();
    if (!latestVersion) {
      Logger.error('Could not fetch latest version from npm');
      return;
    }

    Logger.info(`📦 Current version: ${currentVersion}`);
    Logger.info(`📦 Latest version: ${latestVersion}`);

    if (currentVersion === latestVersion) {
      Logger.success('sheet-cmd is already up to date!');
      return;
    }

    Logger.loading('Detecting package manager...');

    const packageManager = await detectPackageManager();

    if (!packageManager) {
      Logger.error('Could not detect how sheet-cmd was installed');
      Logger.dim('Please update manually using your package manager');
      return;
    }

    Logger.info(`📦 Detected package manager: ${packageManager}`);
    Logger.loading(`Updating sheet-cmd from ${currentVersion} to ${latestVersion}...`);

    const updateCommand = getUpdateCommand(packageManager);
    const { stdout, stderr } = await execAsync(updateCommand);

    if (stderr && !stderr.includes('npm WARN')) {
      Logger.error(`Error updating: ${stderr}`);
      return;
    }

    Logger.success(`sheet-cmd updated successfully from ${currentVersion} to ${latestVersion}!`);

    if (stdout) {
      Logger.dim(stdout);
    }

    const completionReinstalled = await reinstallCompletionSilently();
    if (completionReinstalled) {
      Logger.dim('✨ Shell completion updated');
      Logger.info('');
      Logger.info('To activate the updated completion, run:');

      const currentShell = process.env.SHELL || '';
      if (currentShell.includes('zsh')) {
        Logger.info('  exec zsh');
      } else if (currentShell.includes('bash')) {
        Logger.info('  exec bash');
      } else {
        Logger.info('  # Restart your shell');
      }
    }
  }
});

async function detectPackageManager(): Promise<PackageManager | null> {
  const npmPath = await getGlobalNpmPath();

  if (!npmPath) {
    return null;
  }

  const possiblePaths = [
    { manager: PackageManager.Npm, patterns: ['/npm/', '\\npm\\', '/node/', '\\node\\'] },
    { manager: PackageManager.Yarn, patterns: ['/yarn/', '\\yarn\\', '/.yarn/', '\\.yarn\\'] },
    { manager: PackageManager.Pnpm, patterns: ['/pnpm/', '\\pnpm\\', '/.pnpm/', '\\.pnpm\\'] }
  ];

  for (const { manager, patterns } of possiblePaths) {
    if (patterns.some((pattern) => npmPath.includes(pattern))) {
      return manager;
    }
  }

  return PackageManager.Npm;
}

async function getGlobalNpmPath(): Promise<string | null> {
  const isWindows = platform() === 'win32';

  try {
    const whereCommand = isWindows ? 'where' : 'which';
    const { stdout } = await execAsync(`${whereCommand} sheet-cmd`);
    const execPath = stdout.trim();

    if (execPath) {
      if (!isWindows) {
        try {
          const { stdout: realPath } = await execAsync(`readlink -f "${execPath}"`);
          return realPath.trim() || execPath;
        } catch {
          return execPath;
        }
      }
      return execPath;
    }
  } catch {
    try {
      const { stdout } = await execAsync('npm list -g --depth=0 sheet-cmd');
      if (stdout.includes('sheet-cmd')) {
        return PackageManager.Npm;
      }
    } catch {}
  }

  return null;
}

function getCurrentVersion(): string | null {
  try {
    const packagePath = join(__dirname, '../../package.json');
    const packageJson = JSON.parse(readFileSync(packagePath, 'utf8'));
    return packageJson.version;
  } catch {
    return null;
  }
}

async function getLatestVersion(): Promise<string | null> {
  try {
    const { stdout } = await execAsync('npm view sheet-cmd version');
    return stdout.trim();
  } catch {
    return null;
  }
}

function getUpdateCommand(packageManager: PackageManager): string {
  return updateCommandsByPackageManager[packageManager];
}
