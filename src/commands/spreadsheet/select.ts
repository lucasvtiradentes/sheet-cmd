import inquirer from 'inquirer';
import { defineSubCommand, flag } from '../../cli/define';
import { ConfigManager } from '../../config/config-manager';
import { getSpreadsheetTitle } from '../../core/spreadsheet-title';
import { Logger } from '../../utils/logger';
import { parseSpreadsheetId } from '../../utils/spreadsheet';

export const selectSpreadsheetCommand = defineSubCommand({
  name: 'select',
  description: 'Select a different spreadsheet (sets as active)',
  flags: [
    flag.string('--id', 'Spreadsheet ID or URL (skips interactive selection)', { alias: '-i' }),
    flag.boolean('--add', 'Add the spreadsheet if it is not configured'),
    flag.string('--name', 'Local name to use with --add')
  ],
  errorMessage: 'Failed to select spreadsheet',
  action: async ({ options }) => {
    const configManager = new ConfigManager();
    const activeAccount = configManager.getActiveAccount();

    if (!activeAccount) {
      Logger.error('No active account set.');
      Logger.info('Use: gsheet account add');
      process.exit(1);
    }

    const spreadsheetIdOption = options.id ?? (options as Record<string, string | number | boolean | undefined>).i;
    let spreadsheetId = spreadsheetIdOption !== undefined ? parseSpreadsheetId(String(spreadsheetIdOption)) : undefined;

    if (!spreadsheetId) {
      const spreadsheets = configManager.listSpreadsheets(activeAccount.email);

      if (spreadsheets.length === 0) {
        Logger.warning('No spreadsheets configured. Use "gsheet spreadsheet add" to add one.');
        return;
      }

      const activeSpreadsheet = configManager.getActiveSpreadsheetName(activeAccount.email);

      const answer = await inquirer.prompt([
        {
          type: 'list',
          name: 'spreadsheet',
          message: 'Select spreadsheet:',
          choices: spreadsheets.map((s) => ({
            name: s.name === activeSpreadsheet ? `${s.name} (current)` : s.name,
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

    let spreadsheet = configManager.getSpreadsheetById(activeAccount.email, spreadsheetId);
    if (!spreadsheet) {
      if (!options.add) {
        Logger.error(`Spreadsheet with ID '${spreadsheetId}' not found`);
        Logger.info('Use --add to add and select this spreadsheet.');
        process.exit(1);
      }

      const name =
        options.name?.trim() || (await getSpreadsheetTitle(configManager, activeAccount.email, spreadsheetId));
      await configManager.addSpreadsheet(activeAccount.email, name, spreadsheetId);
      spreadsheet = configManager.getSpreadsheetById(activeAccount.email, spreadsheetId);
      Logger.success(`Added spreadsheet: ${name}`);
    }

    const spreadsheetName = Object.entries(configManager.listSpreadsheets(activeAccount.email)).find(
      ([_, s]) => s.spreadsheetId === spreadsheetId
    )?.[1]?.name;

    if (!spreadsheetName) {
      Logger.error(`Spreadsheet with ID '${spreadsheetId}' not found`);
      process.exit(1);
    }

    configManager.setActiveSpreadsheet(activeAccount.email, spreadsheetName);
    Logger.success(`Selected spreadsheet: ${spreadsheetName}`);
  }
});
