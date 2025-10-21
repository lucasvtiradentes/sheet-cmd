import { Command } from 'commander';
import { getGoogleSheetsService } from '../../../core/command-helpers.js';
import { createSubCommandFromSchema } from '../../../definitions/command-builder.js';
import type { SheetAppendOptions } from '../../../definitions/command-types.js';
import { CommandNames, SubCommandNames } from '../../../definitions/types.js';
import { Logger } from '../../../utils/logger.js';

export function createAppendCommand(): Command {
  return createSubCommandFromSchema(
    CommandNames.SHEET,
    SubCommandNames.SHEET_APPEND,
    async (options: SheetAppendOptions) => {
      try {
        const sheetsService = await getGoogleSheetsService();

        const values = options.values.split(',').map((v) => v.trim());

        Logger.loading(`Appending row to '${options.name}'...`);
        await sheetsService.appendRow(options.name, values);

        Logger.success(`Row appended to '${options.name}' successfully`);
      } catch (error) {
        Logger.error('Failed to append row', error);
        process.exit(1);
      }
    }
  );
}
