import { defineSubCommand, flag } from '../../cli/define';
import { ConfigManager } from '../../config/config-manager';
import { Logger } from '../../utils/logger';
import { getSpreadsheetUrl } from '../../utils/spreadsheet';

export const activeSpreadsheetCommand = defineSubCommand({
  name: 'active',
  description: 'Show the currently active spreadsheet',
  flags: [flag.string('--output', 'Output format', { alias: '-o' })],
  errorMessage: 'Failed to get active spreadsheet',
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
      Logger.info('Use "sheet-cmd spreadsheet select <name>" to set one.');
      return;
    }

    const activeSpreadsheet = configManager.getSpreadsheet(activeAccount.email, activeSpreadsheetName);

    if (!activeSpreadsheet) {
      Logger.error('Active spreadsheet not found.');
      return;
    }

    if (options.output === 'json') {
      Logger.json({
        activeAccount: activeAccount.email,
        name: activeSpreadsheetName,
        spreadsheetId: activeSpreadsheet.spreadsheet_id,
        url: getSpreadsheetUrl(activeSpreadsheet.spreadsheet_id),
        activeSheet: activeSpreadsheet.activeSheet ?? null
      });
      return;
    }

    Logger.success(`Active spreadsheet: ${activeSpreadsheetName}`);
    Logger.dim(`  ID: ${activeSpreadsheet.spreadsheet_id}`);
    Logger.dim(`  URL: ${getSpreadsheetUrl(activeSpreadsheet.spreadsheet_id)}`);
    if (activeSpreadsheet.activeSheet) {
      Logger.dim(`  Active sheet: ${activeSpreadsheet.activeSheet}`);
    }
  }
});
