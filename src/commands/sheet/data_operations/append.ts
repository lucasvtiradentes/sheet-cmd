import { Command } from 'commander';
import { getActiveSheetName, getGoogleSheetsService } from '../../../core/command-helpers.js';
import { createSubCommandFromSchema } from '../../../definitions/command-builder.js';
import type { SheetAppendOptions } from '../../../definitions/command-types.js';
import { CommandNames, SubCommandNames } from '../../../definitions/types.js';
import { Logger } from '../../../utils/logger.js';

export function createAppendCommand(): Command {
  const sheetAppendCommand = async (options: SheetAppendOptions) => {
    const sheetsService = await getGoogleSheetsService();
    const sheetName = getActiveSheetName(options.name);

    const values = options.values.split(',').map((v) => v.trim());

    Logger.loading(`Appending row to '${sheetName}'...`);
    await sheetsService.appendRow(sheetName, values);

    Logger.success(`Row appended to '${sheetName}' successfully`);
  };

  return createSubCommandFromSchema(
    CommandNames.SHEET,
    SubCommandNames.SHEET_APPEND,
    sheetAppendCommand,
    'Failed to append row'
  );
}
