import { Command } from 'commander';
import { getActiveSheetName, getGoogleSheetsService } from '../../../core/command-helpers.js';
import { createSubCommandFromSchema } from '../../../definitions/command-builder.js';
import type { SheetRemoveOptions } from '../../../definitions/command-types.js';
import { CommandNames, SubCommandNames } from '../../../definitions/types.js';
import { Logger } from '../../../utils/logger.js';

export function createRemoveCommand(): Command {
  const sheetRemoveCommand = async (options: SheetRemoveOptions) => {
    const sheetsService = await getGoogleSheetsService();
    const sheetName = getActiveSheetName(options.name);

    Logger.loading(`Removing sheet '${sheetName}'...`);
    await sheetsService.removeSheet(sheetName);

    Logger.success(`Sheet '${sheetName}' removed successfully`);
  };

  return createSubCommandFromSchema(
    CommandNames.SHEET,
    SubCommandNames.SHEET_REMOVE,
    sheetRemoveCommand,
    'Failed to remove sheet'
  );
}
