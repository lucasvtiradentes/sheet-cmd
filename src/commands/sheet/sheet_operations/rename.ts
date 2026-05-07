import type { Program as CaporalProgram } from '@caporal/core';
import { getActiveSheetName, getGoogleSheetsService } from '../../../core/command-helpers';
import { createSubCommandFromSchema } from '../../../definitions/command-builder';
import type { SheetRenameOptions } from '../../../definitions/command-types';
import { CommandNames, SubCommandNames } from '../../../definitions/types';
import { Logger } from '../../../utils/logger';

export function createRenameCommand(program: CaporalProgram): void {
  const sheetRenameCommand = async (options: SheetRenameOptions) => {
    const sheetsService = await getGoogleSheetsService();
    const sheetName = getActiveSheetName(options.name);

    Logger.loading(`Renaming sheet '${sheetName}' to '${options.newName}'...`);
    await sheetsService.renameSheet(sheetName, options.newName);

    Logger.success(`Sheet '${sheetName}' renamed to '${options.newName}' successfully`);
  };

  createSubCommandFromSchema(
    program,
    CommandNames.SHEET,
    SubCommandNames.SHEET_RENAME,
    sheetRenameCommand,
    'Failed to rename sheet'
  );
}
