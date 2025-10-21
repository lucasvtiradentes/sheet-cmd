import { ConfigManager } from './config-manager.js';
import { GoogleSheetsService } from './google-sheets.service.js';
import { Logger } from './logger.js';

export async function getGoogleSheetsService(spreadsheetName?: string): Promise<GoogleSheetsService> {
  const configManager = new ConfigManager();

  const activeAccount = configManager.getActiveAccount();
  if (!activeAccount) {
    Logger.error('No active account set.');
    Logger.info('Use: sheet-cmd account add');
    process.exit(1);
  }

  let resolvedSpreadsheetName = spreadsheetName;

  if (!resolvedSpreadsheetName) {
    const activeSpreadsheetName = configManager.getActiveSpreadsheetName(activeAccount.email);
    if (!activeSpreadsheetName) {
      Logger.error('No spreadsheet specified and no active spreadsheet set.');
      Logger.info('Use --spreadsheet flag or run: sheet-cmd spreadsheet switch <name>');
      process.exit(1);
    }
    resolvedSpreadsheetName = activeSpreadsheetName;
  }

  const spreadsheet = configManager.getSpreadsheet(activeAccount.email, resolvedSpreadsheetName);

  if (!spreadsheet) {
    Logger.error(`Spreadsheet '${resolvedSpreadsheetName}' not found. Use "sheet-cmd spreadsheet add" to add one.`);
    process.exit(1);
  }

  const refreshedCredentials = await configManager.getRefreshedCredentials(activeAccount.email);

  return new GoogleSheetsService({
    spreadsheetId: spreadsheet.spreadsheet_id,
    oauthCredentials: refreshedCredentials
  });
}
