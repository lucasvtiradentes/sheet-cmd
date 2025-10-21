import { Command } from 'commander';

import { getGoogleSheetsService } from '../../../core/command-helpers.js';
import { Logger } from '../../../utils/logger.js';

export function createAddCommand(): Command {
  return new Command('add')
    .description('Add a new sheet to the spreadsheet')
    .requiredOption('-n, --name <name>', 'Sheet name to create')
    .option('-s, --spreadsheet <name>', 'Spreadsheet name (uses active spreadsheet if not specified)')
    .action(async (options: { name: string; spreadsheet?: string }) => {
      try {
        const sheetsService = await getGoogleSheetsService(options.spreadsheet);

        Logger.loading(`Creating sheet '${options.name}'...`);
        await sheetsService.addSheet(options.name);

        Logger.success(`Sheet '${options.name}' created successfully`);
      } catch (error) {
        Logger.error('Failed to add sheet', error);
        process.exit(1);
      }
    });
}
