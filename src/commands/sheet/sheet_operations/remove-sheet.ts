import { Command } from 'commander';

import { getGoogleSheetsService } from '../../../lib/command-helpers.js';
import { Logger } from '../../../lib/logger.js';

export function createRemoveSheetCommand(): Command {
  return new Command('remove-sheet')
    .description('Remove a sheet from the spreadsheet')
    .requiredOption('-n, --name <name>', 'Sheet name to remove')
    .option('-s, --spreadsheet <name>', 'Spreadsheet name (uses active spreadsheet if not specified)')
    .action(async (options: { name: string; spreadsheet?: string }) => {
      try {
        const sheetsService = await getGoogleSheetsService(options.spreadsheet);

        Logger.loading(`Removing sheet '${options.name}'...`);
        await sheetsService.removeSheet(options.name);

        Logger.success(`Sheet '${options.name}' removed successfully`);
      } catch (error) {
        Logger.error('Failed to remove sheet', error);
        process.exit(1);
      }
    });
}
