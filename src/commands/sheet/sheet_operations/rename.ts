import { Command } from 'commander';
import { getActiveSheetName, getGoogleSheetsService } from '../../../core/command-helpers.js';
import { createSubCommandFromSchema } from '../../../definitions/command-builder.js';
import type { SheetRenameOptions } from '../../../definitions/command-types.js';
import { CommandNames, SubCommandNames } from '../../../definitions/types.js';
import { Logger } from '../../../utils/logger.js';

export function createRenameCommand(): Command {
  return createSubCommandFromSchema(
    CommandNames.SHEET,
    SubCommandNames.SHEET_RENAME,
    async (options: SheetRenameOptions) => {
      try {
        const sheetsService = await getGoogleSheetsService();
        const sheetName = getActiveSheetName(options.name);

        Logger.loading(`Renaming sheet '${sheetName}' to '${options.newName}'...`);
        await sheetsService.renameSheet(sheetName, options.newName);

        Logger.success(`Sheet '${sheetName}' renamed to '${options.newName}' successfully`);
      } catch (error) {
        Logger.error('Failed to rename sheet', error);
        process.exit(1);
      }
    }
  );
}
