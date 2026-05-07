import inquirer from 'inquirer';
import { defineSubCommand, flag } from '../../../cli/define';
import { ConfigManager } from '../../../config/config-manager';
import { getGoogleSheetsService } from '../../../core/command-helpers';
import { Logger } from '../../../utils/logger';

export const selectCommand = defineSubCommand({
  name: 'select',
  description: 'Select a sheet (sets as active)',
  flags: [flag.string('--name', 'Tab name (skips interactive selection)', { alias: '-n' })],
  errorMessage: 'Failed to select sheet',
  action: async ({ options }) => {
    const configManager = new ConfigManager();
    const activeAccount = configManager.getActiveAccount();

    if (!activeAccount) {
      Logger.error('No active account set.');
      Logger.info('Use: gsheet account add');
      process.exit(1);
    }

    const activeSpreadsheetName = configManager.getActiveSpreadsheetName(activeAccount.email);
    if (!activeSpreadsheetName) {
      Logger.error('No active spreadsheet set.');
      Logger.info('Use: gsheet spreadsheet select <name>');
      process.exit(1);
    }

    let sheetName = options.name;

    if (!sheetName) {
      const sheetsService = await getGoogleSheetsService();
      Logger.loading('Fetching sheets...');
      const info = await sheetsService.getSheetInfo();

      if (info.sheets.length === 0) {
        Logger.warning('No sheets found in spreadsheet.');
        return;
      }

      const activeSheet = configManager.getActiveSheetName(activeAccount.email, activeSpreadsheetName);

      const answer = await inquirer.prompt([
        {
          type: 'list',
          name: 'sheet',
          message: 'Select sheet:',
          choices: info.sheets.map((s) => ({
            name: s.title === activeSheet ? `${s.title} (current)` : s.title,
            value: s.title
          }))
        }
      ]);

      sheetName = answer.sheet;
    }

    if (!sheetName) {
      Logger.error('No sheet name provided');
      return;
    }

    configManager.setActiveSheet(activeAccount.email, activeSpreadsheetName, sheetName);
    Logger.success(`Selected sheet: ${sheetName}`);
  }
});
