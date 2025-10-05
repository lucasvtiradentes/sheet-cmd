import { Command } from 'commander';
import inquirer from 'inquirer';

import { ConfigManager } from '../../../lib/config-manager.js';
import { Logger } from '../../../lib/logger.js';

export function createSwitchSpreadsheetCommand(): Command {
  return new Command('switch')
    .description('Switch to a different spreadsheet (sets it as active)')
    .argument('[name]', 'Name of the spreadsheet to switch to')
    .action(async (name?: string) => {
      try {
        const configManager = new ConfigManager();

        let spreadsheetName = name;

        if (!spreadsheetName) {
          const spreadsheets = configManager.getAllSpreadsheets();

          if (spreadsheets.length === 0) {
            Logger.warning('No spreadsheets configured. Use "sheet-cmd spreadsheet add" to add one.');
            return;
          }

          const activeSpreadsheet = configManager.getActiveSpreadsheetName();

          const answer = await inquirer.prompt([
            {
              type: 'list',
              name: 'spreadsheet',
              message: 'Select spreadsheet to switch to:',
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

        configManager.setActiveSpreadsheet(spreadsheetName);
        Logger.success(`Switched to spreadsheet: ${spreadsheetName}`);
      } catch (error) {
        Logger.error('Failed to switch spreadsheet', error);
        process.exit(1);
      }
    });
}
