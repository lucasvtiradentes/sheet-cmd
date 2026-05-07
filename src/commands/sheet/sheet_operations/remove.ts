import { Command } from 'commander';
import { getActiveSheetName, getGoogleSheetsService } from '../../../core/command-helpers';
import { createSubCommandFromSchema } from '../../../definitions/command-builder';
import type { SheetRemoveOptions } from '../../../definitions/command-types';
import { CommandNames, SubCommandNames } from '../../../definitions/types';
import { Logger } from '../../../utils/logger';

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
