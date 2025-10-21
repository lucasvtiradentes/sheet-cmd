import { Command } from 'commander';
import inquirer from 'inquirer';
import { ConfigManager } from '../../../config/config-manager.js';
import { createSubCommandFromSchema } from '../../../definitions/command-builder.js';
import type { SpreadsheetSelectOptions } from '../../../definitions/command-types.js';
import { CommandNames, SubCommandNames } from '../../../definitions/types.js';
import { Logger } from '../../../utils/logger.js';

export function createSelectSpreadsheetCommand(): Command {
  const command = createSubCommandFromSchema(
    CommandNames.SPREADSHEET,
    SubCommandNames.SPREADSHEET_SELECT,
    async (options: SpreadsheetSelectOptions) => {
      try {
        const configManager = new ConfigManager();
        const activeAccount = configManager.getActiveAccount();

        if (!activeAccount) {
          Logger.error('No active account set.');
          Logger.info('Use: sheet-cmd account add');
          process.exit(1);
        }

        let spreadsheetName = options.name;

        if (!spreadsheetName) {
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
                value: s.name
              }))
            }
          ]);

          spreadsheetName = answer.spreadsheet;
        }

        if (!spreadsheetName) {
          Logger.error('No spreadsheet name provided');
          return;
        }

        configManager.setActiveSpreadsheet(activeAccount.email, spreadsheetName);
        Logger.success(`Selected spreadsheet: ${spreadsheetName}`);
      } catch (error) {
        Logger.error('Failed to select spreadsheet', error);
        process.exit(1);
      }
    }
  );

  command.argument('[spreadsheetName]', 'Spreadsheet name to select (optional - interactive if not provided)');

  return command;
}
