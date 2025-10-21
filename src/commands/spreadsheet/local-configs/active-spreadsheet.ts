import { Command } from 'commander';

import { ConfigManager } from '../../../lib/config-manager.js';
import { Logger } from '../../../lib/logger.js';

export function createActiveSpreadsheetCommand(): Command {
  return new Command('active').description('Show the currently active spreadsheet').action(async () => {
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
      Logger.info('Use "sheet-cmd spreadsheet switch <name>" to set one.');
      return;
    }

    const activeSpreadsheet = configManager.getSpreadsheet(activeAccount.email, activeSpreadsheetName);

    if (!activeSpreadsheet) {
      Logger.error('Active spreadsheet not found.');
      return;
    }

    Logger.success(`Active spreadsheet: ${activeSpreadsheetName}`);
    Logger.dim(`  ID: ${activeSpreadsheet.spreadsheet_id}`);
  });
}
