import { ConfigManager } from '../config/config-manager';
import { Logger } from '../utils/logger';
import { GoogleSheetsService } from './google-sheets.service';

export async function getGoogleSheetsService(): Promise<GoogleSheetsService> {
  const configManager = new ConfigManager();

  const activeAccount = configManager.getActiveAccount();
  if (!activeAccount) {
    Logger.error('No active account set.');
    Logger.info('Use: gsheet account add');
    process.exit(1);
  }

  const activeSpreadsheetName = configManager.getActiveSpreadsheetName(activeAccount.email);
  if (!activeSpreadsheetName) {
    Logger.error('No active spreadsheet set.');
    Logger.info('Use: gsheet spreadsheet select <name>');
    process.exit(1);
  }

  const spreadsheet = configManager.getSpreadsheet(activeAccount.email, activeSpreadsheetName);

  if (!spreadsheet) {
    Logger.error(`Spreadsheet '${activeSpreadsheetName}' not found. Use "gsheet spreadsheet add" to add one.`);
    process.exit(1);
  }

  const refreshedCredentials = await configManager.getRefreshedCredentials(activeAccount.email);

  return new GoogleSheetsService({
    spreadsheetId: spreadsheet.spreadsheet_id,
    oauthCredentials: refreshedCredentials
  });
}

export function getActiveSheetName(sheetName?: string): string {
  if (sheetName) {
    return sheetName;
  }

  const configManager = new ConfigManager();
  const activeAccount = configManager.getActiveAccount();

  if (!activeAccount) {
    Logger.error('No active account set.');
    Logger.info('Use: gsheet account add');
    process.exit(1);
  }

  const activeSpreadsheetName = configManager.getActiveSpreadsheetName(activeAccount.email);
  if (!activeSpreadsheetName) {
    Logger.error('No active spreadsheet set.');
    Logger.info('Use: gsheet spreadsheet select <name>');
    process.exit(1);
  }

  const activeSheetName = configManager.getActiveSheetName(activeAccount.email, activeSpreadsheetName);
  if (!activeSheetName) {
    Logger.error('No active sheet set.');
    Logger.info('Use: gsheet sheet select');
    process.exit(1);
  }

  return activeSheetName;
}
