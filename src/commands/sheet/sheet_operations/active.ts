import { defineSubCommand, flag } from '../../../cli/define';
import { ConfigManager } from '../../../config/config-manager';
import { getGoogleSheetsService } from '../../../core/command-helpers';
import { Logger } from '../../../utils/logger';

export const activeCommand = defineSubCommand({
  name: 'active',
  description: 'Show the currently active sheet',
  flags: [flag.string('--output', 'Output format', { alias: '-o' })],
  errorMessage: 'Failed to get active sheet',
  action: async ({ options }) => {
    const configManager = new ConfigManager();
    const activeAccount = configManager.getActiveAccount();

    if (!activeAccount) {
      Logger.error('No active account set.');
      Logger.info('Use: sheet-cmd account add');
      return;
    }

    const activeSpreadsheetName = configManager.getActiveSpreadsheetName(activeAccount.email);
    if (!activeSpreadsheetName) {
      Logger.warning('No active spreadsheet set.');
      Logger.info('Use: sheet-cmd spreadsheet select');
      return;
    }

    const activeSheetName = configManager.getActiveSheetName(activeAccount.email, activeSpreadsheetName);
    if (!activeSheetName) {
      Logger.warning('No active sheet set.');
      Logger.info('Use: sheet-cmd sheet select');
      return;
    }

    const sheetsService = await getGoogleSheetsService();
    const info = await sheetsService.getSheetInfo();
    const activeSheet = info.sheets.find((sheet) => sheet.title === activeSheetName);

    if (options.output === 'json') {
      Logger.json({
        spreadsheetTitle: info.title,
        spreadsheetName: activeSpreadsheetName,
        sheet: activeSheet
          ? {
              title: activeSheet.title,
              index: activeSheet.index,
              sheetId: activeSheet.sheetId
            }
          : {
              title: activeSheetName,
              index: null,
              sheetId: null
            }
      });
      return;
    }

    Logger.success(`Active sheet: ${activeSheetName}`);
    Logger.dim(`  Spreadsheet: ${activeSpreadsheetName}`);
    if (activeSheet) {
      Logger.dim(`  Index: ${activeSheet.index + 1}`);
      Logger.dim(`  ID: ${activeSheet.sheetId}`);
    }
  }
});
