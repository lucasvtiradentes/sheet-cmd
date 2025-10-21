import { Command } from 'commander';
import inquirer from 'inquirer';
import { ConfigManager } from '../../config/config-manager.js';
import { Logger } from '../../utils/logger.js';

export function createRemoveAccountCommand(): Command {
  const command = new Command('remove');

  command
    .description('Remove a Google account and all its spreadsheets (interactive)')
    .argument('[email]', 'Account email to remove (optional - interactive if not provided)')
    .action(async (email?: string) => {
      try {
        const configManager = new ConfigManager();
        const accounts = configManager.getAllAccounts();

        if (accounts.length === 0) {
          Logger.warning('No accounts configured.');
          Logger.info('Use: sheet-cmd account add');
          process.exit(0);
        }

        let selectedEmail = email;

        if (!selectedEmail) {
          const choices = accounts.map((acc) => ({
            name: acc.email,
            value: acc.email
          }));

          const answer = await inquirer.prompt([
            {
              type: 'list',
              name: 'email',
              message: 'Select account to remove:',
              choices
            }
          ]);

          selectedEmail = answer.email;
        }

        if (!selectedEmail) {
          Logger.error('No account selected');
          process.exit(1);
        }

        const account = configManager.getAccount(selectedEmail);
        if (!account) {
          Logger.error(`Account '${selectedEmail}' not found`);
          process.exit(1);
        }

        const spreadsheetCount = Object.keys(account.spreadsheets).length;
        if (spreadsheetCount > 0) {
          Logger.warning(
            `This will remove ${spreadsheetCount} spreadsheet${spreadsheetCount !== 1 ? 's' : ''} associated with this account.`
          );
        }

        const confirmation = await inquirer.prompt([
          {
            type: 'confirm',
            name: 'confirmed',
            message: `Are you sure you want to remove account '${selectedEmail}'?`,
            default: false
          }
        ]);

        if (!confirmation.confirmed) {
          Logger.info('Removal cancelled');
          process.exit(0);
        }

        await configManager.removeAccount(selectedEmail);
        Logger.success(`Account '${selectedEmail}' removed successfully`);
      } catch (error) {
        Logger.error(`Failed to remove account: ${error instanceof Error ? error.message : 'Unknown error'}`);
        process.exit(1);
      }
    });

  return command;
}
