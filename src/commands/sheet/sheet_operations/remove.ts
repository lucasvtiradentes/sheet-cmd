import { defineSubCommand, flag } from '../../../cli/define';
import { getActiveSheetName, getGoogleSheetsService } from '../../../core/command-helpers';
import { Logger } from '../../../utils/logger';

export const removeCommand = defineSubCommand({
  name: 'remove',
  description: 'Remove a sheet from the spreadsheet',
  flags: [flag.string('--name', 'Tab name (uses active if not provided)', { alias: '-n' })],
  errorMessage: 'Failed to remove sheet',
  action: async ({ options }) => {
    const sheetsService = await getGoogleSheetsService();
    const sheetName = getActiveSheetName(options.name);

    Logger.loading(`Removing sheet '${sheetName}'...`);
    await sheetsService.removeSheet(sheetName);

    Logger.success(`Sheet '${sheetName}' removed successfully`);
  }
});
