import { defineSubCommand, flag } from '../../../cli/define';
import { getActiveSheetName, getGoogleSheetsService } from '../../../core/command-helpers';
import { Logger } from '../../../utils/logger';

export const copyCommand = defineSubCommand({
  name: 'copy',
  description: 'Copy a sheet to a new sheet',
  flags: [
    flag.string('--name', 'Source tab name (uses active if not provided)', { alias: '-n' }),
    flag.string('--to', 'Destination tab name', { required: true })
  ],
  errorMessage: 'Failed to copy sheet',
  action: async ({ options }) => {
    const sheetsService = await getGoogleSheetsService();
    const sheetName = getActiveSheetName(options.name);

    Logger.loading(`Copying sheet '${sheetName}' to '${options.to}'...`);
    await sheetsService.copySheet(sheetName, options.to);

    Logger.success(`Sheet '${sheetName}' copied to '${options.to}' successfully`);
  }
});
