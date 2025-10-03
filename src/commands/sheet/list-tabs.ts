import { Command } from 'commander';

import { ConfigManager } from '../../lib/config-manager.js';
import { GoogleSheetsService } from '../../lib/google-sheets.service.js';
import { Logger } from '../../lib/logger.js';

export function createListTabsCommand(): Command {
  return new Command('list-tabs')
    .description('List all tabs/sheets in a spreadsheet')
    .requiredOption('-s, --spreadsheet <name>', 'Spreadsheet name')
    .action(async (options: { spreadsheet: string }) => {
      try {
        const configManager = new ConfigManager();
        const spreadsheet = configManager.getSpreadsheet(options.spreadsheet);

        if (!spreadsheet) {
          Logger.error(`Spreadsheet '${options.spreadsheet}' not found. Use "sheet add" to add one.`);
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
