import { Command } from 'commander';

import { getGoogleSheetsService } from '../../../core/command-helpers.js';
import { Logger } from '../../../utils/logger.js';

export function createRemoveCommand(): Command {
  return new Command('remove')
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
