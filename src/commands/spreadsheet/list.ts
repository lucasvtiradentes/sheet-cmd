import { defineSubCommand, flag } from '../../cli/define';
import { ConfigManager } from '../../config/config-manager';
import { Logger } from '../../utils/logger';
import { getSpreadsheetUrl } from '../../utils/spreadsheet';

export const listSpreadsheetsCommand = defineSubCommand({
  name: 'list',
  description: 'List all configured spreadsheets',
  flags: [flag.string('--output', 'Output format', { alias: '-o' })],
  errorMessage: 'Failed to list spreadsheets',
  action: async ({ options }) => {
    const configManager = new ConfigManager();
    const activeAccount = configManager.getActiveAccount();

    if (!activeAccount) {
      Logger.error('No active account set.');
      Logger.info('Use: gsheet account add');
      return;
    }

    const spreadsheets = configManager.listSpreadsheets(activeAccount.email);
    const activeSpreadsheetName = configManager.getActiveSpreadsheetName(activeAccount.email);

    if (options.output === 'json') {
      Logger.json({
        activeAccount: activeAccount.email,
        activeSpreadsheet: activeSpreadsheetName,
        spreadsheets: spreadsheets.map((spreadsheet) => ({
          name: spreadsheet.name,
          spreadsheetId: spreadsheet.spreadsheetId,
          url: getSpreadsheetUrl(spreadsheet.spreadsheetId),
          activeSheet: spreadsheet.activeSheet ?? null,
          active: spreadsheet.name === activeSpreadsheetName
        }))
      });
      return;
    }

    if (spreadsheets.length === 0) {
      Logger.warning('No spreadsheets configured. Use "gsheet spreadsheet add" to add one.');
      return;
    }

    Logger.bold(`\nSpreadsheets for ${activeAccount.email}:`);
    spreadsheets.forEach((spreadsheet) => {
      const isActive = spreadsheet.name === activeSpreadsheetName;
      const marker = isActive ? '* ' : '  ';
      Logger.plain(`${marker}${spreadsheet.name}${isActive ? ' (active)' : ''}`);
      Logger.dim(`    ID: ${spreadsheet.spreadsheetId}`);
      Logger.dim(`    URL: ${getSpreadsheetUrl(spreadsheet.spreadsheetId)}`);
      if (spreadsheet.activeSheet) {
        Logger.dim(`    Active sheet: ${spreadsheet.activeSheet}`);
      }
    });

    if (activeSpreadsheetName) {
      Logger.plain('');
      Logger.dim('* = active spreadsheet');
    }
  }
});
