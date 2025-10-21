import { Command } from 'commander';

import { getGoogleSheetsService } from '../../../core/command-helpers.js';
import { Logger } from '../../../utils/logger.js';

export function createRenameSheetCommand(): Command {
  return new Command('rename-sheet')
    .description('Rename a sheet in the spreadsheet')
    .requiredOption('-n, --name <name>', 'Current sheet name')
    .requiredOption('--new-name <name>', 'New sheet name')
    .option('-s, --spreadsheet <name>', 'Spreadsheet name (uses active spreadsheet if not specified)')
    .action(async (options: { name: string; newName: string; spreadsheet?: string }) => {
      try {
        const sheetsService = await getGoogleSheetsService(options.spreadsheet);

        Logger.loading(`Renaming sheet '${options.name}' to '${options.newName}'...`);
        await sheetsService.renameSheet(options.name, options.newName);

        Logger.success(`Sheet '${options.name}' renamed to '${options.newName}' successfully`);
      } catch (error) {
        Logger.error('Failed to rename sheet', error);
        process.exit(1);
      }
    });
}
