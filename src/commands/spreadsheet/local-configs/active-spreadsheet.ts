import { Command } from 'commander';
import { ConfigManager } from '../../../config/config-manager.js';
import { createSubCommandFromSchema } from '../../../definitions/command-builder.js';
import { CommandNames, SubCommandNames } from '../../../definitions/types.js';
import { Logger } from '../../../utils/logger.js';

export function createActiveSpreadsheetCommand(): Command {
  const spreadsheetActiveCommand = async () => {
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

    Logger.success(`Active spreadsheet: ${activeSpreadsheetName}`);
    Logger.dim(`  ID: ${activeSpreadsheet.spreadsheet_id}`);
  };

  return createSubCommandFromSchema(
    CommandNames.SPREADSHEET,
    SubCommandNames.SPREADSHEET_ACTIVE,
    spreadsheetActiveCommand,
    'Failed to get active spreadsheet'
  );
}
