import { Command } from 'commander';

import { ConfigManager } from '../../lib/config-manager.js';
import { Logger } from '../../lib/logger.js';

export function createActiveSpreadsheetCommand(): Command {
  return new Command('active')
    .description('Show the currently active spreadsheet')
    .action(async () => {
      const configManager = new ConfigManager();
      const activeSpreadsheet = configManager.getActiveSpreadsheet();

      if (!activeSpreadsheet) {
        Logger.warning('No active spreadsheet set.');
        Logger.info('Use "sheet-cmd spreadsheet switch <name>" to set one.');
        return;
      }

      Logger.success(`Active spreadsheet: ${activeSpreadsheet.name}`);
      Logger.dim(`  ID: ${activeSpreadsheet.spreadsheet_id}`);
    });
}
