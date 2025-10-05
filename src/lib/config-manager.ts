import * as fs from 'fs';

import { CONFIG_PATHS } from '../constants.js';
import type { SheetsConfig, SpreadsheetCredentials, UserMetadata } from '../types/local.js';
import { sheetsConfigSchema, userMetadataSchema } from '../types/local.js';
import { readJson, writeJson } from '../utils/json-utils.js';

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
      config_path: CONFIG_PATHS.defaultConfigFile
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
      spreadsheets: {},
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

  // Public API Methods

  async addSpreadsheet(
    name: string,
    spreadsheetId: string,
    serviceAccountEmail: string,
    privateKey: string
  ): Promise<void> {
    const config = this.loadConfig();

    if (config.spreadsheets[name]) {
      throw new Error(`Spreadsheet '${name}' already exists`);
    }

    const spreadsheet: SpreadsheetCredentials = {
      name,
      spreadsheet_id: spreadsheetId,
      service_account_email: serviceAccountEmail,
      private_key: privateKey
    };

    config.spreadsheets[name] = spreadsheet;
    this.saveConfig();
  }

  async removeSpreadsheet(name: string): Promise<void> {
    const config = this.loadConfig();

    if (!config.spreadsheets[name]) {
      throw new Error(`Spreadsheet '${name}' not found`);
    }

    delete config.spreadsheets[name];
    this.saveConfig();

    // Clear active spreadsheet if it's the one being removed
    if (this.userMetadata?.active_spreadsheet === name) {
      this.clearActiveSpreadsheet();
    }
  }

  getAllSpreadsheets(): SpreadsheetCredentials[] {
    const config = this.loadConfig();
    return Object.values(config.spreadsheets);
  }

  getSpreadsheet(name: string): SpreadsheetCredentials | null {
    const config = this.loadConfig();
    return config.spreadsheets[name] || null;
  }

  listSpreadsheets(): Array<{ name: string; spreadsheetId: string }> {
    const config = this.loadConfig();

    return Object.entries(config.spreadsheets).map(([name, spreadsheet]) => ({
      name,
      spreadsheetId: spreadsheet.spreadsheet_id
    }));
  }

  // Active spreadsheet management

  setActiveSpreadsheet(name: string): void {
    const config = this.loadConfig();

    if (!config.spreadsheets[name]) {
      throw new Error(`Spreadsheet '${name}' not found`);
    }

    if (!this.userMetadata) {
      throw new Error('User metadata not loaded');
    }

    this.userMetadata.active_spreadsheet = name;
    writeJson(CONFIG_PATHS.userMetadataFile, this.userMetadata);
  }

  getActiveSpreadsheet(): SpreadsheetCredentials | null {
    if (!this.userMetadata?.active_spreadsheet) {
      return null;
    }

    return this.getSpreadsheet(this.userMetadata.active_spreadsheet);
  }

  getActiveSpreadsheetName(): string | null {
    return this.userMetadata?.active_spreadsheet || null;
  }

  clearActiveSpreadsheet(): void {
    if (!this.userMetadata) {
      throw new Error('User metadata not loaded');
    }

    this.userMetadata.active_spreadsheet = undefined;
    writeJson(CONFIG_PATHS.userMetadataFile, this.userMetadata);
  }

  // Completion tracking

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
