import { Command } from 'commander';
import inquirer from 'inquirer';
import { ConfigManager } from '../../../config/config-manager.js';
import { createSubCommandFromSchema } from '../../../definitions/command-builder.js';
import type { SpreadsheetSelectOptions } from '../../../definitions/command-types.js';
import { CommandNames, SubCommandNames } from '../../../definitions/types.js';
import { Logger } from '../../../utils/logger.js';

export function createSelectSpreadsheetCommand(): Command {
  const spreadsheetSelectCommand = async (options: SpreadsheetSelectOptions) => {
      const configManager = new ConfigManager();
      const activeAccount = configManager.getActiveAccount();

      if (!activeAccount) {
        Logger.error('No active account set.');
        Logger.info('Use: sheet-cmd account add');
        process.exit(1);
      }

      let spreadsheetId = options.id;

      if (!spreadsheetId) {
        const spreadsheets = configManager.listSpreadsheets(activeAccount.email);

        if (spreadsheets.length === 0) {
          Logger.warning('No spreadsheets configured. Use "sheet-cmd spreadsheet add" to add one.');
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

      configManager.setActiveSpreadsheet(activeAccount.email, spreadsheetName);
      Logger.success(`Selected spreadsheet: ${spreadsheetName}`);
    };

  return createSubCommandFromSchema(
    CommandNames.SPREADSHEET,
    SubCommandNames.SPREADSHEET_SELECT,
    spreadsheetSelectCommand,
    'Failed to select spreadsheet'
  );
}
