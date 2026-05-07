import { existsSync, readFileSync } from 'fs';
import * as os from 'os';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const packageJsonPath = findPackageJsonPath(__dirname);
const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf-8'));

export const APP_INFO = {
  name: 'gsheet',
  packageName: packageJson.name,
  display_name: 'Google Sheets CLI',
  version: packageJson.version
};

enum SupportedOS {
  Linux = 'linux',
  Mac = 'mac',
  Windows = 'windows',
  Wsl = 'wsl'
}

const configDirectoryByOS = {
  [SupportedOS.Linux]: (homeDir: string) => path.join(homeDir, '.config', APP_INFO.name),
  [SupportedOS.Wsl]: (homeDir: string) => path.join(homeDir, '.config', APP_INFO.name),
  [SupportedOS.Mac]: (homeDir: string) => path.join(homeDir, 'Library', 'Preferences', APP_INFO.name),
  [SupportedOS.Windows]: (homeDir: string) => path.join(homeDir, 'AppData', 'Roaming', APP_INFO.name)
} as const satisfies Record<SupportedOS, (homeDir: string) => string>;

export function getUserOS(): SupportedOS {
  const platform = os.platform();

  if (platform === 'linux') {
    try {
      const release = os.release().toLowerCase();
      if (release.includes('microsoft') || release.includes('wsl')) {
        return SupportedOS.Wsl;
      }
    } catch {}
    return SupportedOS.Linux;
  }

  if (platform === 'darwin') return SupportedOS.Mac;
  if (platform === 'win32') return SupportedOS.Windows;

  throw new Error(`Unsupported OS: ${platform}`);
}

export function getConfigDirectory(): string {
  const userOS = getUserOS();
  const homeDir = os.homedir();

  return configDirectoryByOS[userOS](homeDir);
}

export const CONFIG_PATHS = {
  configDir: getConfigDirectory(),
  userMetadataFile: path.join(getConfigDirectory(), 'user_metadata.json'),
  defaultConfigFile: path.join(getConfigDirectory(), 'config.json')
};

export const OAUTH_SCOPES = {
  SPREADSHEETS: 'https://www.googleapis.com/auth/spreadsheets',
  DRIVE_READONLY: 'https://www.googleapis.com/auth/drive.readonly',
  USERINFO_EMAIL: 'https://www.googleapis.com/auth/userinfo.email'
};

export const GOOGLE_API_URLS = {
  USERINFO: 'https://www.googleapis.com/oauth2/v2/userinfo',
  SHEETS_CREATE: 'https://sheets.google.com'
};

export const GOOGLE_CLOUD_CONSOLE_URLS = {
  CREDENTIALS: 'https://console.cloud.google.com/apis/credentials',
  CONSENT_SCREEN: 'https://console.cloud.google.com/apis/credentials/consent',
  SCOPES: 'https://console.cloud.google.com/auth/scopes',
  TEST_USERS: 'https://console.cloud.google.com/auth/audience',
  ENABLE_SHEETS_API: 'https://console.cloud.google.com/apis/library/sheets.googleapis.com',
  ENABLE_DRIVE_API: 'https://console.cloud.google.com/apis/library/drive.googleapis.com'
};

export const OAUTH_CONFIG = {
  REDIRECT_HOST: '127.0.0.1',
  REDIRECT_PATH: '/callback',
  ACCESS_TYPE: 'offline' as const,
  PROMPT: 'consent' as const
};

export const TOKEN_REFRESH_THRESHOLD_MS = 5 * 60 * 1000;

function findPackageJsonPath(startDir: string): string {
  let currentDir = startDir;

  while (true) {
    const candidate = path.join(currentDir, 'package.json');

    if (existsSync(candidate)) {
      return candidate;
    }

    const parentDir = path.dirname(currentDir);
    if (parentDir === currentDir) {
      throw new Error('Could not find package.json');
    }

    currentDir = parentDir;
  }
}
