import { Command } from 'commander';

import { ConfigManager } from '../../lib/config-manager.js';
import { GoogleSheetsService } from '../../lib/google-sheets.service.js';
import { Logger } from '../../lib/logger.js';

export function createListTabsCommand(): Command {
  return new Command('list-tabs')
    .description('List all tabs/sheets in a spreadsheet')
    .option('-s, --spreadsheet <name>', 'Spreadsheet name (uses active spreadsheet if not specified)')
    .action(async (options: { spreadsheet?: string }) => {
      try {
        const configManager = new ConfigManager();

        let spreadsheetName = options.spreadsheet;

        // If no spreadsheet specified, use active one
        if (!spreadsheetName) {
          const activeSpreadsheet = configManager.getActiveSpreadsheet();
          if (!activeSpreadsheet) {
            Logger.error('No spreadsheet specified and no active spreadsheet set.');
            Logger.info('Use --spreadsheet flag or run: sheet-cmd spreadsheet switch <name>');
            process.exit(1);
          }
          spreadsheetName = activeSpreadsheet.name;
        }

        const spreadsheet = configManager.getSpreadsheet(spreadsheetName);

        if (!spreadsheet) {
          Logger.error(`Spreadsheet '${spreadsheetName}' not found. Use "sheet-cmd spreadsheet add" to add one.`);
          process.exit(1);
        }

        const sheetsService = new GoogleSheetsService({
          spreadsheetId: spreadsheet.spreadsheet_id,
          serviceAccountEmail: spreadsheet.service_account_email,
          privateKey: spreadsheet.private_key
        });

        Logger.loading('Fetching spreadsheet info...');
        const info = await sheetsService.getSheetInfo();

        Logger.success(`Connected to spreadsheet: ${info.title}`);
        Logger.bold(`\n📋 Tabs (${info.sheets.length}):\n`);

        info.sheets.forEach((sheet) => {
          Logger.plain(`  ${sheet.index + 1}. ${sheet.title}`);
        });
      } catch (error) {
        Logger.error('Failed to list tabs', error);
        process.exit(1);
      }
    });
}
