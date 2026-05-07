import { defineSubCommand, flag } from '../../../cli/define';
import { getGoogleSheetsService } from '../../../core/command-helpers';
import { Logger } from '../../../utils/logger';

export const addCommand = defineSubCommand({
  name: 'add',
  description: 'Add a new sheet to the spreadsheet',
  flags: [flag.string('--name', 'Tab name', { alias: '-n', required: true })],
  errorMessage: 'Failed to add sheet',
  action: async ({ options }) => {
    const sheetsService = await getGoogleSheetsService();

    Logger.loading(`Creating sheet '${options.name}'...`);
    await sheetsService.addSheet(options.name);

    Logger.success(`Sheet '${options.name}' created successfully`);
  }
});
