import { defineSubCommand, flag } from '../../../cli/define';
import { getActiveSheetName, getGoogleSheetsService } from '../../../core/command-helpers';
import { Logger } from '../../../utils/logger';
import { inferCellType } from '../../../utils/type-inference';

export const appendCommand = defineSubCommand({
  name: 'append',
  description: 'Append a new row to the end of the sheet',
  flags: [
    flag.string('--name', 'Tab name (uses active if not provided)', { alias: '-n' }),
    flag.string('--value', 'Values to append (comma-separated)', { alias: '-v', required: true }),
    flag.boolean('--no-infer-types', 'Keep values as text instead of inferring exact numeric strings')
  ],
  errorMessage: 'Failed to append row',
  action: async ({ options }) => {
    const sheetsService = await getGoogleSheetsService();
    const sheetName = getActiveSheetName(options.name);

    const inferTypes = options.inferTypes !== false;
    const values = options.value.split(',').map((value) => {
      const trimmed = value.trim();
      return inferTypes ? inferCellType(trimmed) : trimmed;
    });

    Logger.loading(`Appending row to '${sheetName}'...`);
    await sheetsService.appendRow(sheetName, values);

    Logger.success(`Row appended to '${sheetName}' successfully`);
  }
});
