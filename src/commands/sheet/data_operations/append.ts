import { defineSubCommand, flag } from '../../../cli/define';
import { getActiveSheetName, getGoogleSheetsService } from '../../../core/command-helpers';
import { Logger } from '../../../utils/logger';

export const appendCommand = defineSubCommand({
  name: 'append',
  description: 'Append a new row to the end of the sheet',
  flags: [
    flag.string('--name', 'Tab name (uses active if not provided)', { alias: '-n' }),
    flag.string('--value', 'Values to append (comma-separated)', { alias: '-v', required: true })
  ],
  errorMessage: 'Failed to append row',
  action: async ({ options }) => {
    const sheetsService = await getGoogleSheetsService();
    const sheetName = getActiveSheetName(options.name);

    const values = options.value.split(',').map((v) => v.trim());

    Logger.loading(`Appending row to '${sheetName}'...`);
    await sheetsService.appendRow(sheetName, values);

    Logger.success(`Row appended to '${sheetName}' successfully`);
  }
});
