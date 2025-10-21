import { Command } from 'commander';

import { getGoogleSheetsService } from '../../../core/command-helpers.js';
import { Logger } from '../../../utils/logger.js';

export function createAppendCommand(): Command {
  return new Command('append')
    .description('Append a new row to the end of the sheet')
    .requiredOption('-n, --name <name>', 'Sheet name')
    .requiredOption('-v, --values <values>', 'Comma-separated values for the row')
    .option('-s, --spreadsheet <name>', 'Spreadsheet name (uses active spreadsheet if not specified)')
    .action(async (options: { name: string; values: string; spreadsheet?: string }) => {
      try {
        const sheetsService = await getGoogleSheetsService(options.spreadsheet);

        const values = options.values.split(',').map((v) => v.trim());

        Logger.loading(`Appending row to '${options.name}'...`);
        await sheetsService.appendRow(options.name, values);

        Logger.success(`Row appended to '${options.name}' successfully`);
      } catch (error) {
        Logger.error('Failed to append row', error);
        process.exit(1);
      }
    });
}
