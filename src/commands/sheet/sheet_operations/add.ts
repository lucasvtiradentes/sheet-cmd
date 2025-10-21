import { Command } from 'commander';
import { getGoogleSheetsService } from '../../../core/command-helpers.js';
import { createSubCommandFromSchema } from '../../../definitions/command-builder.js';
import type { SheetAddOptions } from '../../../definitions/command-types.js';
import { CommandNames, SubCommandNames } from '../../../definitions/types.js';
import { Logger } from '../../../utils/logger.js';

export function createAddCommand(): Command {
  return createSubCommandFromSchema(CommandNames.SHEET, SubCommandNames.SHEET_ADD, async (options: SheetAddOptions) => {
    try {
      const sheetsService = await getGoogleSheetsService();

      Logger.loading(`Creating sheet '${options.name}'...`);
      await sheetsService.addSheet(options.name);

      Logger.success(`Sheet '${options.name}' created successfully`);
    } catch (error) {
      Logger.error('Failed to add sheet', error);
      process.exit(1);
    }
  });
}
