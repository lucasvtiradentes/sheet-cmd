import { Command } from 'commander';
import { getGoogleSheetsService } from '../../../core/command-helpers.js';
import { createSubCommandFromSchema } from '../../../definitions/command-builder.js';
import type { SheetRemoveOptions } from '../../../definitions/command-types.js';
import { CommandNames, SubCommandNames } from '../../../definitions/types.js';
import { Logger } from '../../../utils/logger.js';

export function createRemoveCommand(): Command {
  return createSubCommandFromSchema(
    CommandNames.SHEET,
    SubCommandNames.SHEET_REMOVE,
    async (options: SheetRemoveOptions) => {
      try {
        const sheetsService = await getGoogleSheetsService(options.spreadsheet);

        Logger.loading(`Removing sheet '${options.name}'...`);
        await sheetsService.removeSheet(options.name);

        Logger.success(`Sheet '${options.name}' removed successfully`);
      } catch (error) {
        Logger.error('Failed to remove sheet', error);
        process.exit(1);
      }
    }
  );
}
