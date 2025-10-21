import { Command } from 'commander';

import { getGoogleSheetsService } from '../../../core/command-helpers.js';
import { Logger } from '../../../utils/logger.js';

export function createCopyCommand(): Command {
  return new Command('copy')
    .description('Copy a sheet to a new sheet')
    .requiredOption('-n, --name <name>', 'Sheet name to copy')
    .requiredOption('--to <name>', 'New sheet name')
    .option('-s, --spreadsheet <name>', 'Spreadsheet name (uses active spreadsheet if not specified)')
    .action(async (options: { name: string; to: string; spreadsheet?: string }) => {
      try {
        const sheetsService = await getGoogleSheetsService(options.spreadsheet);

        Logger.loading(`Copying sheet '${options.name}' to '${options.to}'...`);
        await sheetsService.copySheet(options.name, options.to);

        Logger.success(`Sheet '${options.name}' copied to '${options.to}' successfully`);
      } catch (error) {
        Logger.error('Failed to copy sheet', error);
        process.exit(1);
      }
    });
}
