import { defineSubCommand, flag } from '../../../cli/define';
import { getActiveSheetName, getGoogleSheetsService } from '../../../core/command-helpers';
import { Logger } from '../../../utils/logger';

export const renameCommand = defineSubCommand({
  name: 'rename',
  description: 'Rename a sheet in the spreadsheet',
  flags: [
    flag.string('--name', 'Current tab name (uses active if not provided)', { alias: '-n' }),
    flag.string('--new-name', 'New tab name', { required: true })
  ],
  errorMessage: 'Failed to rename sheet',
  action: async ({ options }) => {
    const sheetsService = await getGoogleSheetsService();
    const sheetName = getActiveSheetName(options.name);

    Logger.loading(`Renaming sheet '${sheetName}' to '${options.newName}'...`);
    await sheetsService.renameSheet(sheetName, options.newName);

    Logger.success(`Sheet '${sheetName}' renamed to '${options.newName}' successfully`);
  }
});
