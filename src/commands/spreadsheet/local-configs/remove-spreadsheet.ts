import inquirer from 'inquirer';
import { ConfigManager } from '../../../config/config-manager';
import { Logger } from '../../../utils/logger';
import { parseSpreadsheetId } from '../../../utils/spreadsheet';
import { defineSubCommand, flag } from '../../define';

export const removeSpreadsheetCommand = defineSubCommand({
  name: 'remove',
  description: 'Remove a spreadsheet configuration',
  flags: [flag.string('--id', 'Spreadsheet ID or URL (skips interactive selection)')],
  errorMessage: 'Failed to remove spreadsheet',
  action: async ({ options }) => {
    const configManager = new ConfigManager();
    const activeAccount = configManager.getActiveAccount();

    if (!activeAccount) {
      Logger.error('No active account set.');
      Logger.info('Use: sheet-cmd account add');
      process.exit(1);
    }

    let spreadsheetId = options.id ? parseSpreadsheetId(options.id) : undefined;

    if (!spreadsheetId) {
      const spreadsheets = configManager.listSpreadsheets(activeAccount.email);

      if (spreadsheets.length === 0) {
        Logger.warning('No spreadsheets configured.');
        return;
      }

      const answer = await inquirer.prompt([
        {
          type: 'list',
          name: 'spreadsheet',
          message: 'Select spreadsheet to remove:',
          choices: spreadsheets.map((s) => ({
            name: s.name,
            value: s.spreadsheetId
          }))
        }
      ]);

      spreadsheetId = answer.spreadsheet;
    }

    if (!spreadsheetId) {
      Logger.error('No spreadsheet ID provided');
      return;
    }

    const spreadsheet = configManager.getSpreadsheetById(activeAccount.email, spreadsheetId);
    if (!spreadsheet) {
      Logger.error(`Spreadsheet with ID '${spreadsheetId}' not found`);
      process.exit(1);
    }

    const spreadsheetName = Object.entries(configManager.listSpreadsheets(activeAccount.email)).find(
      ([_, s]) => s.spreadsheetId === spreadsheetId
    )?.[1]?.name;

    if (!spreadsheetName) {
      Logger.error(`Spreadsheet with ID '${spreadsheetId}' not found`);
      process.exit(1);
    }

    const confirm = await inquirer.prompt([
      {
        type: 'confirm',
        name: 'confirmed',
        message: `Are you sure you want to remove '${spreadsheetName}'?`,
        default: false
      }
    ]);

    if (!confirm.confirmed) {
      Logger.info('Cancelled');
      return;
    }

    await configManager.removeSpreadsheet(activeAccount.email, spreadsheetName);
    Logger.success(`Spreadsheet '${spreadsheetName}' removed successfully!`);
  }
});
