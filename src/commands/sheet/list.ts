import { defineSubCommand, flag } from '../../cli/define';
import { getGoogleSheetsService } from '../../core/command-helpers';
import { Logger } from '../../utils/logger';

export const listCommand = defineSubCommand({
  name: 'list',
  description: 'List all sheets in a spreadsheet',
  flags: [flag.string('--output', 'Output format', { alias: '-o' })],
  errorMessage: 'Failed to list sheets',
  action: async ({ options }) => {
    const sheetsService = await getGoogleSheetsService();

    if (options.output !== 'json') {
      Logger.loading('Fetching spreadsheet info...');
    }
    const info = await sheetsService.getSheetInfo();

    if (options.output === 'json') {
      Logger.json(info);
      return;
    }

    Logger.success(`Connected to spreadsheet: ${info.title}`);
    Logger.bold(`\n📋 Sheets (${info.sheets.length}):\n`);

    info.sheets.forEach((sheet) => {
      Logger.plain(`  ${sheet.index + 1}. ${sheet.title}`);
      Logger.dim(`     ID: ${sheet.sheetId}`);
    });
  }
});
