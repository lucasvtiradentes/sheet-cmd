export type { OAuthFlowOptions, OAuthFlowResult } from './auth/oauth-flow';
export { performOAuthFlow } from './auth/oauth-flow';
export { assertRequiredOAuthScopes } from './auth/oauth-scopes';
export { refreshToken, refreshTokenIfNeeded } from './auth/token-refresh';

import { performOAuthFlow } from './auth/oauth-flow';
import { refreshToken } from './auth/token-refresh';

export { ConfigManager } from './config/config-manager';

import { ConfigManager } from './config/config-manager';

export {
  APP_INFO,
  CONFIG_PATHS,
  GOOGLE_API_URLS,
  getConfigDirectory,
  getUserOS,
  OAUTH_CONFIG,
  OAUTH_SCOPES,
  TOKEN_REFRESH_THRESHOLD_MS
} from './config/constants';
export type {
  Account,
  OAuthCredentials,
  SheetData,
  SheetsConfig,
  SpreadsheetConfig,
  UserMetadata
} from './config/types';

import type { Account, OAuthCredentials, SpreadsheetConfig } from './config/types';

export {
  accountSchema,
  oauthCredentialsSchema,
  sheetDataSchema,
  sheetsConfigSchema,
  spreadsheetConfigSchema,
  userMetadataSchema
} from './config/types';
export type { DriveSpreadsheet } from './core/google-drive.service';
export { GoogleDriveService } from './core/google-drive.service';

import { GoogleDriveService } from './core/google-drive.service';

export type { GoogleSheetsConfig } from './core/google-sheets.service';
export { GoogleSheetsService } from './core/google-sheets.service';

import { type GoogleSheetsConfig, GoogleSheetsService } from './core/google-sheets.service';

export { parseCSV } from './utils/csv';
export { formatAsCSV, formatAsJSON, formatAsMarkdown } from './utils/formatters';
export { readJson, writeJson } from './utils/json';

export interface SheetCmdClientOptions {
  configManager?: ConfigManager;
}

export interface LoginOptions {
  clientId: string;
  clientSecret: string;
  loginHint?: string;
  onAuthUrl?: (url: string) => void;
  setActive?: boolean;
}

export interface ReauthOptions {
  email?: string;
  loginHint?: string;
  onAuthUrl?: (url: string) => void;
}

export interface SheetServiceOptions {
  accountEmail?: string;
  spreadsheetName?: string;
}

export interface DriveServiceOptions {
  accountEmail?: string;
}

export function createSheetsService(config: GoogleSheetsConfig): GoogleSheetsService {
  return new GoogleSheetsService(config);
}

export function createDriveService(oauthCredentials: OAuthCredentials): GoogleDriveService {
  return new GoogleDriveService(oauthCredentials);
}

export class SheetCmdClient {
  private configManager: ConfigManager;

  constructor(options: SheetCmdClientOptions = {}) {
    this.configManager = options.configManager ?? new ConfigManager();
  }

  async login(options: LoginOptions): Promise<Account> {
    const result = await performOAuthFlow(options.clientId, options.clientSecret, {
      loginHint: options.loginHint,
      onAuthUrl: options.onAuthUrl
    });

    await this.configManager.addAccount(result.email, result.credentials);

    if (options.setActive ?? this.configManager.getAllAccounts().length === 1) {
      this.configManager.setActiveAccount(result.email);
    }

    const account = this.configManager.getAccount(result.email);
    if (!account) {
      throw new Error(`Account '${result.email}' not found after login`);
    }

    return account;
  }

  async reauth(options: ReauthOptions = {}): Promise<Account> {
    const account = options.email
      ? this.configManager.getAccount(options.email)
      : this.configManager.getActiveAccount();
    if (!account) {
      throw new Error(options.email ? `Account '${options.email}' not found` : 'No active account set');
    }

    const result = await performOAuthFlow(account.oauth.client_id, account.oauth.client_secret, {
      loginHint: options.loginHint ?? account.email,
      onAuthUrl: options.onAuthUrl
    });

    await this.configManager.updateAccountCredentials(account.email, result.credentials);

    const updatedAccount = this.configManager.getAccount(account.email);
    if (!updatedAccount) {
      throw new Error(`Account '${account.email}' not found after reauth`);
    }

    return updatedAccount;
  }

  listAccounts(): Account[] {
    return this.configManager.getAllAccounts();
  }

  getAccount(email: string): Account | null {
    return this.configManager.getAccount(email);
  }

  getActiveAccount(): Account | null {
    return this.configManager.getActiveAccount();
  }

  selectAccount(email: string): void {
    this.configManager.setActiveAccount(email);
  }

  async removeAccount(email: string): Promise<void> {
    await this.configManager.removeAccount(email);
  }

  async addSpreadsheet(email: string, name: string, spreadsheetId: string): Promise<void> {
    await this.configManager.addSpreadsheet(email, name, spreadsheetId);
  }

  async removeSpreadsheet(email: string, name: string): Promise<void> {
    await this.configManager.removeSpreadsheet(email, name);
  }

  listSpreadsheets(email = this.requireActiveAccount().email): Array<{
    name: string;
    spreadsheetId: string;
    activeSheet?: string;
  }> {
    return this.configManager.listSpreadsheets(email);
  }

  getSpreadsheet(email: string, name: string): SpreadsheetConfig | null {
    return this.configManager.getSpreadsheet(email, name);
  }

  selectSpreadsheet(email: string, name: string): void {
    this.configManager.setActiveSpreadsheet(email, name);
  }

  getActiveSpreadsheet(email = this.requireActiveAccount().email): SpreadsheetConfig | null {
    return this.configManager.getActiveSpreadsheet(email);
  }

  getActiveSpreadsheetName(email = this.requireActiveAccount().email): string | null {
    return this.configManager.getActiveSpreadsheetName(email);
  }

  selectSheet(email: string, spreadsheetName: string, sheetName: string): void {
    this.configManager.setActiveSheet(email, spreadsheetName, sheetName);
  }

  getActiveSheetName(email = this.requireActiveAccount().email, spreadsheetName?: string): string | null {
    return this.configManager.getActiveSheetName(email, spreadsheetName ?? this.requireActiveSpreadsheetName(email));
  }

  async getSheetsService(options: SheetServiceOptions = {}): Promise<GoogleSheetsService> {
    const account = options.accountEmail ? this.requireAccount(options.accountEmail) : this.requireActiveAccount();
    const spreadsheetName = options.spreadsheetName ?? this.requireActiveSpreadsheetName(account.email);
    const spreadsheet = this.requireSpreadsheet(account.email, spreadsheetName);
    const oauthCredentials = await this.configManager.getRefreshedCredentials(account.email);

    return createSheetsService({
      spreadsheetId: spreadsheet.spreadsheet_id,
      oauthCredentials
    });
  }

  async getDriveService(options: DriveServiceOptions = {}): Promise<GoogleDriveService> {
    const account = options.accountEmail ? this.requireAccount(options.accountEmail) : this.requireActiveAccount();
    const oauthCredentials = await this.configManager.getRefreshedCredentials(account.email);
    return createDriveService(oauthCredentials);
  }

  async refreshAccountCredentials(email: string): Promise<OAuthCredentials> {
    const account = this.requireAccount(email);
    const credentials = await refreshToken(account.oauth);
    await this.configManager.updateAccountCredentials(email, credentials);
    return credentials;
  }

  private requireActiveAccount(): Account {
    const account = this.configManager.getActiveAccount();
    if (!account) {
      throw new Error('No active account set');
    }
    return account;
  }

  private requireAccount(email: string): Account {
    const account = this.configManager.getAccount(email);
    if (!account) {
      throw new Error(`Account '${email}' not found`);
    }
    return account;
  }

  private requireActiveSpreadsheetName(email: string): string {
    const spreadsheetName = this.configManager.getActiveSpreadsheetName(email);
    if (!spreadsheetName) {
      throw new Error(`No active spreadsheet set for account '${email}'`);
    }
    return spreadsheetName;
  }

  private requireSpreadsheet(email: string, name: string): SpreadsheetConfig {
    const spreadsheet = this.configManager.getSpreadsheet(email, name);
    if (!spreadsheet) {
      throw new Error(`Spreadsheet '${name}' not found for account '${email}'`);
    }
    return spreadsheet;
  }
}
