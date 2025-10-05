import { Command } from 'commander';
import inquirer from 'inquirer';

import { ConfigManager } from '../../../lib/config-manager.js';
import { Logger } from '../../../lib/logger.js';

export function createAddSpreadsheetCommand(): Command {
  return new Command('add')
    .description('Add a new spreadsheet configuration')
    .action(async () => {
      try {
        const answers = await inquirer.prompt([
          {
            type: 'input',
            name: 'name',
            message: 'Enter a name for this spreadsheet:',
            validate: (input: string) => {
              if (!input.trim()) {
                return 'Name cannot be empty';
              }
              return true;
            }
          },
          {
            type: 'input',
            name: 'spreadsheetId',
            message: 'Enter the spreadsheet ID:',
            validate: (input: string) => {
              if (!input.trim()) {
                return 'Spreadsheet ID cannot be empty';
              }
              return true;
            }
          },
          {
            type: 'input',
            name: 'serviceAccountEmail',
            message: 'Enter the service account email:',
            validate: (input: string) => {
              if (!input.trim()) {
                return 'Service account email cannot be empty';
              }
              return true;
            }
          },
          {
            type: 'editor',
            name: 'privateKey',
            message: 'Enter the private key (opens editor):',
            validate: (input: string) => {
              if (!input.trim()) {
                return 'Private key cannot be empty';
              }
              if (!input.includes('BEGIN PRIVATE KEY')) {
                return 'Invalid private key format';
              }
              return true;
            }
          }
        ]);

        const configManager = new ConfigManager();
        await configManager.addSpreadsheet(
          answers.name,
          answers.spreadsheetId,
          answers.serviceAccountEmail,
          answers.privateKey
        );

        Logger.success(`Spreadsheet '${answers.name}' added successfully!`);
      } catch (error) {
        Logger.error('Failed to add spreadsheet', error);
        process.exit(1);
      }
    });
}
