import { Command } from 'commander';
import { getActiveSheetName, getGoogleSheetsService } from '../../../core/command-helpers.js';
import { createSubCommandFromSchema } from '../../../definitions/command-builder.js';
import type { SheetRenameOptions } from '../../../definitions/command-types.js';
import { CommandNames, SubCommandNames } from '../../../definitions/types.js';
import { Logger } from '../../../utils/logger.js';

export function createRenameCommand(): Command {
  const sheetRenameCommand = async (options: SheetRenameOptions) => {
    const sheetsService = await getGoogleSheetsService();
    const sheetName = getActiveSheetName(options.name);

    Logger.loading(`Renaming sheet '${sheetName}' to '${options.newName}'...`);
    await sheetsService.renameSheet(sheetName, options.newName);

    Logger.success(`Sheet '${sheetName}' renamed to '${options.newName}' successfully`);
  };

  return createSubCommandFromSchema(
    CommandNames.SHEET,
    SubCommandNames.SHEET_RENAME,
    sheetRenameCommand,
    'Failed to rename sheet'
  );
}
