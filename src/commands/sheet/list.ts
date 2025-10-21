import { Command } from 'commander';

import { getGoogleSheetsService } from '../../core/command-helpers.js';
import { Logger } from '../../utils/logger.js';

export function createListCommand(): Command {
  return new Command('list')
    .description('List all sheets in a spreadsheet')
    .option('-s, --spreadsheet <name>', 'Spreadsheet name (uses active spreadsheet if not specified)')
    .action(async (options: { spreadsheet?: string }) => {
      try {
        const sheetsService = await getGoogleSheetsService(options.spreadsheet);

        Logger.loading('Fetching spreadsheet info...');
        const info = await sheetsService.getSheetInfo();

        Logger.success(`Connected to spreadsheet: ${info.title}`);
        Logger.bold(`\n📋 Sheets (${info.sheets.length}):\n`);

        info.sheets.forEach((sheet) => {
          Logger.plain(`  ${sheet.index + 1}. ${sheet.title}`);
        });
      } catch (error) {
        Logger.error('Failed to list sheets', error);
        process.exit(1);
      }
    });
}
