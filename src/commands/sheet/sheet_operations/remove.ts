import type { Program as CaporalProgram } from '@caporal/core';
import { getActiveSheetName, getGoogleSheetsService } from '../../../core/command-helpers';
import { createSubCommandFromSchema } from '../../../definitions/command-builder';
import type { SheetRemoveOptions } from '../../../definitions/command-types';
import { CommandNames, SubCommandNames } from '../../../definitions/types';
import { Logger } from '../../../utils/logger';

export function createRemoveCommand(program: CaporalProgram): void {
  const sheetRemoveCommand = async (options: SheetRemoveOptions) => {
    const sheetsService = await getGoogleSheetsService();
    const sheetName = getActiveSheetName(options.name);

    Logger.loading(`Removing sheet '${sheetName}'...`);
    await sheetsService.removeSheet(sheetName);

    Logger.success(`Sheet '${sheetName}' removed successfully`);
  };

  createSubCommandFromSchema(
    program,
    CommandNames.SHEET,
    SubCommandNames.SHEET_REMOVE,
    sheetRemoveCommand,
    'Failed to remove sheet'
  );
}
