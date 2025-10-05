import { ConfigManager } from './config-manager.js';
import { GoogleSheetsService } from './google-sheets.service.js';
import { Logger } from './logger.js';

/**
 * Gets a GoogleSheetsService instance for the specified or active spreadsheet.
 * Handles all the boilerplate logic for:
 * - Loading config manager
 * - Resolving active spreadsheet if none specified
 * - Validating spreadsheet exists
 * - Creating service instance with credentials
 *
 * @param spreadsheetName - Optional spreadsheet name. If not provided, uses active spreadsheet.
 * @returns GoogleSheetsService instance ready to use
 * @throws Exits process with error if spreadsheet not found or no active spreadsheet set
 */
export async function getGoogleSheetsService(spreadsheetName?: string): Promise<GoogleSheetsService> {
  const configManager = new ConfigManager();

  let resolvedSpreadsheetName = spreadsheetName;

  if (!resolvedSpreadsheetName) {
    const activeSpreadsheet = configManager.getActiveSpreadsheet();
    if (!activeSpreadsheet) {
      Logger.error('No spreadsheet specified and no active spreadsheet set.');
      Logger.info('Use --spreadsheet flag or run: sheet-cmd spreadsheet switch <name>');
      process.exit(1);
    }
    resolvedSpreadsheetName = activeSpreadsheet.name;
  }

  const spreadsheet = configManager.getSpreadsheet(resolvedSpreadsheetName);

  if (!spreadsheet) {
    Logger.error(`Spreadsheet '${resolvedSpreadsheetName}' not found. Use "sheet-cmd spreadsheet add" to add one.`);
    process.exit(1);
  }

  return new GoogleSheetsService({
    spreadsheetId: spreadsheet.spreadsheet_id,
    serviceAccountEmail: spreadsheet.service_account_email,
    privateKey: spreadsheet.private_key
  });
}
