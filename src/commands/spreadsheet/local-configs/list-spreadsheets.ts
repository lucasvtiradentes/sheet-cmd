import { Command } from 'commander';
import { ConfigManager } from '../../../config/config-manager.js';
import { createSubCommandFromSchema } from '../../../definitions/command-builder.js';
import { CommandNames, SubCommandNames } from '../../../definitions/types.js';
import { Logger } from '../../../utils/logger.js';

export function createListSpreadsheetsCommand(): Command {
  return createSubCommandFromSchema(CommandNames.SPREADSHEET, SubCommandNames.SPREADSHEET_LIST, async () => {
    const configManager = new ConfigManager();
    const activeAccount = configManager.getActiveAccount();

    if (!activeAccount) {
      Logger.error('No active account set.');
      Logger.info('Use: sheet-cmd account add');
      return;
    }

    const spreadsheets = configManager.listSpreadsheets(activeAccount.email);
    const activeSpreadsheetName = configManager.getActiveSpreadsheetName(activeAccount.email);

    if (spreadsheets.length === 0) {
      Logger.warning('No spreadsheets configured. Use "sheet-cmd spreadsheet add" to add one.');
      return;
    }

    Logger.bold(`\nSpreadsheets for ${activeAccount.email}:`);
    spreadsheets.forEach((spreadsheet) => {
      const isActive = spreadsheet.name === activeSpreadsheetName;
      const marker = isActive ? '* ' : '  ';
      Logger.plain(`${marker}${spreadsheet.name}${isActive ? ' (active)' : ''}`);
      Logger.dim(`    ID: ${spreadsheet.spreadsheetId}`);
    });

    if (activeSpreadsheetName) {
      Logger.plain('');
      Logger.dim('* = active spreadsheet');
    }
  });
}
