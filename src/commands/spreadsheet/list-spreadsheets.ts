import { Command } from 'commander';

import { ConfigManager } from '../../lib/config-manager.js';
import { Logger } from '../../lib/logger.js';

export function createListSpreadsheetsCommand(): Command {
  return new Command('list')
    .description('List all configured spreadsheets')
    .action(async () => {
      const configManager = new ConfigManager();
      const spreadsheets = configManager.getAllSpreadsheets();

      if (spreadsheets.length === 0) {
        Logger.warning('No spreadsheets configured. Use "sheet-cmd spreadsheet add" to add one.');
        return;
      }

      Logger.bold('\nConfigured spreadsheets:');
      spreadsheets.forEach((spreadsheet) => {
        Logger.plain(`  • ${spreadsheet.name}`);
        Logger.dim(`    ID: ${spreadsheet.spreadsheet_id}`);
      });
    });
}
