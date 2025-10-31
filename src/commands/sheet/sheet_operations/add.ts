import { Command } from 'commander';
import { getGoogleSheetsService } from '../../../core/command-helpers.js';
import { createSubCommandFromSchema } from '../../../definitions/command-builder.js';
import type { SheetAddOptions } from '../../../definitions/command-types.js';
import { CommandNames, SubCommandNames } from '../../../definitions/types.js';
import { Logger } from '../../../utils/logger.js';

export function createAddCommand(): Command {
  const sheetAddCommand = async (options: SheetAddOptions) => {
    const sheetsService = await getGoogleSheetsService();

    Logger.loading(`Creating sheet '${options.name}'...`);
    await sheetsService.addSheet(options.name);

    Logger.success(`Sheet '${options.name}' created successfully`);
  };

  return createSubCommandFromSchema(
    CommandNames.SHEET,
    SubCommandNames.SHEET_ADD,
    sheetAddCommand,
    'Failed to add sheet'
  );
}
