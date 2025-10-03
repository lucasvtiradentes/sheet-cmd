import { Command } from 'commander';

import { ConfigManager } from '../../lib/config-manager.js';
import { Logger } from '../../lib/logger.js';

export function createListSpreadsheetsCommand(): Command {
  return new Command('list')
    .description('List all configured spreadsheets')
    .action(async () => {
      const configManager = new ConfigManager();
      const spreadsheets = configManager.getAllSpreadsheets();
      const activeSpreadsheetName = configManager.getActiveSpreadsheetName();

      if (spreadsheets.length === 0) {
        Logger.warning('No spreadsheets configured. Use "sheet-cmd spreadsheet add" to add one.');
        return;
      }

      Logger.bold('\nConfigured spreadsheets:');
      spreadsheets.forEach((spreadsheet) => {
        const isActive = spreadsheet.name === activeSpreadsheetName;
        const marker = isActive ? '* ' : '  ';
        Logger.plain(`${marker}${spreadsheet.name}${isActive ? ' (active)' : ''}`);
        Logger.dim(`    ID: ${spreadsheet.spreadsheet_id}`);
      });

      if (activeSpreadsheetName) {
        Logger.plain('');
        Logger.dim('* = active spreadsheet');
      }
    });
}
