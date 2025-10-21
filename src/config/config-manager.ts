import * as fs from 'fs';
import { refreshTokenIfNeeded } from '../auth/token-refresh.js';
import { readJson, writeJson } from '../utils/json.js';
import { CONFIG_PATHS } from './constants.js';
import type { Account, OAuthCredentials, SheetsConfig, SpreadsheetConfig, UserMetadata } from './types.js';
import { sheetsConfigSchema, userMetadataSchema } from './types.js';

export class ConfigManager {
  private userMetadata: UserMetadata | null = null;
  private config: SheetsConfig | null = null;

  constructor() {
    this.ensureConfigDirectory();
    this.initializeUserMetadata();
  }

  private ensureConfigDirectory(): void {
    if (!fs.existsSync(CONFIG_PATHS.configDir)) {
      fs.mkdirSync(CONFIG_PATHS.configDir, { recursive: true });
    }
  }

  private initializeUserMetadata(): void {
    if (!fs.existsSync(CONFIG_PATHS.userMetadataFile)) {
      this.createDefaultUserMetadata();
    }
    this.loadUserMetadata();
  }

  private createDefaultUserMetadata(): void {
    const defaultMetadata: UserMetadata = {
      config_path: CONFIG_PATHS.defaultConfigFile,
      accounts: {}
    };
    writeJson(CONFIG_PATHS.userMetadataFile, defaultMetadata);
  }

  private loadUserMetadata(): void {
    try {
      const data = readJson<UserMetadata>(CONFIG_PATHS.userMetadataFile);
      const validated = userMetadataSchema.parse(data);
      this.userMetadata = validated;
    } catch (error) {
      throw new Error(`Failed to load user metadata: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private saveUserMetadata(): void {
    if (!this.userMetadata) {
      throw new Error('User metadata not loaded');
    }
    writeJson(CONFIG_PATHS.userMetadataFile, this.userMetadata);
  }

  private getConfigPath(): string {
    if (!this.userMetadata) {
      throw new Error('User metadata not loaded');
    }
    return this.userMetadata.config_path;
  }

  private loadConfig(): SheetsConfig {
    if (this.config) {
      return this.config;
    }

    const configPath = this.getConfigPath();

    if (!fs.existsSync(configPath)) {
      this.createDefaultConfig();
    }

    try {
      const data = readJson<SheetsConfig>(configPath);
      const validated = sheetsConfigSchema.parse(data);
      this.config = validated;
      return this.config;
    } catch (error) {
      throw new Error(`Failed to load config: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private createDefaultConfig(): void {
    const defaultConfig: SheetsConfig = {
      settings: {
        max_results: 50,
        default_columns: 'A:Z'
      }
    };

    const configPath = this.getConfigPath();
    writeJson(configPath, defaultConfig);
  }

  private saveConfig(): void {
    if (!this.config) {
      throw new Error('No config to save');
    }

    const configPath = this.getConfigPath();
    writeJson(configPath, this.config);
  }

  async addAccount(email: string, credentials: OAuthCredentials): Promise<void> {
    if (!this.userMetadata) {
      throw new Error('User metadata not loaded');
    }

    if (this.userMetadata.accounts[email]) {
      throw new Error(`Account '${email}' already exists`);
    }

    const account: Account = {
      email,
      oauth: credentials,
      spreadsheets: {}
    };

    this.userMetadata.accounts[email] = account;
    this.saveUserMetadata();
  }

  async removeAccount(email: string): Promise<void> {
    if (!this.userMetadata) {
      throw new Error('User metadata not loaded');
    }

    if (!this.userMetadata.accounts[email]) {
      throw new Error(`Account '${email}' not found`);
    }

    delete this.userMetadata.accounts[email];

    if (this.userMetadata.activeAccount === email) {
      this.userMetadata.activeAccount = undefined;
    }

    this.saveUserMetadata();
  }

  getAllAccounts(): Account[] {
    if (!this.userMetadata) {
      throw new Error('User metadata not loaded');
    }

    return Object.values(this.userMetadata.accounts);
  }

  getAccount(email: string): Account | null {
    if (!this.userMetadata) {
      throw new Error('User metadata not loaded');
    }

    return this.userMetadata.accounts[email] || null;
  }

  setActiveAccount(email: string): void {
    if (!this.userMetadata) {
      throw new Error('User metadata not loaded');
    }

    if (!this.userMetadata.accounts[email]) {
      throw new Error(`Account '${email}' not found`);
    }

    this.userMetadata.activeAccount = email;
    this.saveUserMetadata();
  }

  getActiveAccount(): Account | null {
    if (!this.userMetadata?.activeAccount) {
      return null;
    }

    return this.getAccount(this.userMetadata.activeAccount);
  }

  getActiveAccountEmail(): string | null {
    return this.userMetadata?.activeAccount || null;
  }

  async updateAccountCredentials(email: string, credentials: OAuthCredentials): Promise<void> {
    if (!this.userMetadata) {
      throw new Error('User metadata not loaded');
    }

    const account = this.userMetadata.accounts[email];
    if (!account) {
      throw new Error(`Account '${email}' not found`);
    }

    account.oauth = credentials;
    this.saveUserMetadata();
  }

  async getRefreshedCredentials(email: string): Promise<OAuthCredentials> {
    const account = this.getAccount(email);
    if (!account) {
      throw new Error(`Account '${email}' not found`);
    }

    const refreshedCredentials = await refreshTokenIfNeeded(account.oauth);

    if (refreshedCredentials !== account.oauth) {
      await this.updateAccountCredentials(email, refreshedCredentials);
    }

    return refreshedCredentials;
  }

  async addSpreadsheet(email: string, name: string, spreadsheetId: string): Promise<void> {
    if (!this.userMetadata) {
      throw new Error('User metadata not loaded');
    }

    const account = this.userMetadata.accounts[email];
    if (!account) {
      throw new Error(`Account '${email}' not found`);
    }

    if (account.spreadsheets[name]) {
      throw new Error(`Spreadsheet '${name}' already exists for account '${email}'`);
    }

    const spreadsheet: SpreadsheetConfig = {
      spreadsheet_id: spreadsheetId
    };

    account.spreadsheets[name] = spreadsheet;
    this.saveUserMetadata();
  }

  async removeSpreadsheet(email: string, name: string): Promise<void> {
    if (!this.userMetadata) {
      throw new Error('User metadata not loaded');
    }

    const account = this.userMetadata.accounts[email];
    if (!account) {
      throw new Error(`Account '${email}' not found`);
    }

    if (!account.spreadsheets[name]) {
      throw new Error(`Spreadsheet '${name}' not found for account '${email}'`);
    }

    delete account.spreadsheets[name];

    if (account.activeSpreadsheet === name) {
      account.activeSpreadsheet = undefined;
    }

    this.saveUserMetadata();
  }

  listSpreadsheets(email: string): Array<{ name: string; spreadsheetId: string }> {
    if (!this.userMetadata) {
      throw new Error('User metadata not loaded');
    }

    const account = this.userMetadata.accounts[email];
    if (!account) {
      throw new Error(`Account '${email}' not found`);
    }

    return Object.entries(account.spreadsheets).map(([name, spreadsheet]) => ({
      name,
      spreadsheetId: spreadsheet.spreadsheet_id
    }));
  }

  getSpreadsheet(email: string, name: string): SpreadsheetConfig | null {
    if (!this.userMetadata) {
      throw new Error('User metadata not loaded');
    }

    const account = this.userMetadata.accounts[email];
    if (!account) {
      return null;
    }

    return account.spreadsheets[name] || null;
  }

  getSpreadsheetById(email: string, id: string): SpreadsheetConfig | null {
    if (!this.userMetadata) {
      throw new Error('User metadata not loaded');
    }

    const account = this.userMetadata.accounts[email];
    if (!account) {
      return null;
    }

    return Object.values(account.spreadsheets).find((s) => s.spreadsheet_id === id) || null;
  }

  setActiveSpreadsheet(email: string, name: string): void {
    if (!this.userMetadata) {
      throw new Error('User metadata not loaded');
    }

    const account = this.userMetadata.accounts[email];
    if (!account) {
      throw new Error(`Account '${email}' not found`);
    }

    if (!account.spreadsheets[name]) {
      throw new Error(`Spreadsheet '${name}' not found for account '${email}'`);
    }

    account.activeSpreadsheet = name;
    this.saveUserMetadata();
  }

  getActiveSpreadsheet(email: string): SpreadsheetConfig | null {
    if (!this.userMetadata) {
      throw new Error('User metadata not loaded');
    }

    const account = this.userMetadata.accounts[email];
    if (!account || !account.activeSpreadsheet) {
      return null;
    }

    return account.spreadsheets[account.activeSpreadsheet] || null;
  }

  getActiveSpreadsheetName(email: string): string | null {
    if (!this.userMetadata) {
      throw new Error('User metadata not loaded');
    }

    const account = this.userMetadata.accounts[email];
    return account?.activeSpreadsheet || null;
  }

  setActiveSheet(email: string, spreadsheetName: string, sheetName: string): void {
    if (!this.userMetadata) {
      throw new Error('User metadata not loaded');
    }

    const account = this.userMetadata.accounts[email];
    if (!account) {
      throw new Error(`Account '${email}' not found`);
    }

    const spreadsheet = account.spreadsheets[spreadsheetName];
    if (!spreadsheet) {
      throw new Error(`Spreadsheet '${spreadsheetName}' not found for account '${email}'`);
    }

    spreadsheet.activeSheet = sheetName;
    this.saveUserMetadata();
  }

  getActiveSheetName(email: string, spreadsheetName: string): string | null {
    if (!this.userMetadata) {
      throw new Error('User metadata not loaded');
    }

    const account = this.userMetadata.accounts[email];
    if (!account) {
      return null;
    }

    const spreadsheet = account.spreadsheets[spreadsheetName];
    return spreadsheet?.activeSheet || null;
  }

  markCompletionInstalled(): void {
    const config = this.loadConfig();
    if (!config.settings) {
      config.settings = {
        max_results: 50,
        default_columns: 'A:Z'
      };
    }
    config.settings.completion_installed = true;
    this.saveConfig();
  }

  isCompletionInstalled(): boolean {
    const config = this.loadConfig();
    return config.settings?.completion_installed === true;
  }
}
