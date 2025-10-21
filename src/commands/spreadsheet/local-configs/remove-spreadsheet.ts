import { Command } from 'commander';
import inquirer from 'inquirer';

import { ConfigManager } from '../../../lib/config-manager.js';
import { Logger } from '../../../lib/logger.js';

export function createRemoveSpreadsheetCommand(): Command {
  return new Command('remove')
    .description('Remove a spreadsheet from the active account')
    .argument('[name]', 'Name of the spreadsheet to remove')
    .action(async (name?: string) => {
      try {
        const configManager = new ConfigManager();
        const activeAccount = configManager.getActiveAccount();

        if (!activeAccount) {
          Logger.error('No active account set.');
          Logger.info('Use: sheet-cmd account add');
          process.exit(1);
        }

        let spreadsheetName = name;

        if (!spreadsheetName) {
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
              choices: spreadsheets.map((s) => s.name)
            }
          ]);

          spreadsheetName = answer.spreadsheet;
        }

        if (!spreadsheetName) {
          Logger.error('No spreadsheet name provided');
          return;
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
      } catch (error) {
        Logger.error('Failed to remove spreadsheet', error);
        process.exit(1);
      }
    });
}
