import { Command } from 'commander';
import { getGoogleSheetsService } from '../../../core/command-helpers.js';
import { createSubCommandFromSchema } from '../../../definitions/command-builder.js';
import type { SheetCopyOptions } from '../../../definitions/command-types.js';
import { CommandNames, SubCommandNames } from '../../../definitions/types.js';
import { Logger } from '../../../utils/logger.js';

export function createCopyCommand(): Command {
  return createSubCommandFromSchema(
    CommandNames.SHEET,
    SubCommandNames.SHEET_COPY,
    async (options: SheetCopyOptions) => {
      try {
        const sheetsService = await getGoogleSheetsService();

        Logger.loading(`Copying sheet '${options.name}' to '${options.to}'...`);
        await sheetsService.copySheet(options.name, options.to);

        Logger.success(`Sheet '${options.name}' copied to '${options.to}' successfully`);
      } catch (error) {
        Logger.error('Failed to copy sheet', error);
        process.exit(1);
      }
    }
  );
}
