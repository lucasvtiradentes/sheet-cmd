import { Command } from 'commander';
import { getGoogleSheetsService } from '../../core/command-helpers.js';
import { createSubCommandFromSchema } from '../../definitions/command-builder.js';
import type { SheetListOptions } from '../../definitions/command-types.js';
import { CommandNames, SubCommandNames } from '../../definitions/types.js';
import { Logger } from '../../utils/logger.js';

export function createListCommand(): Command {
  return createSubCommandFromSchema(
    CommandNames.SHEET,
    SubCommandNames.SHEET_LIST,
    async (options: SheetListOptions) => {
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
    }
  );
}
