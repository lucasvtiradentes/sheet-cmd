import { Command } from 'commander';
import inquirer from 'inquirer';
import { ConfigManager } from '../../config/config-manager.js';
import { Logger } from '../../utils/logger.js';

export function createSelectAccountCommand(): Command {
  const command = new Command('select');

  command
    .description('Select active Google account (interactive)')
    .argument('[email]', 'Account email to select (optional - interactive if not provided)')
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
          const activeAccount = configManager.getActiveAccount();

          const choices = accounts.map((acc) => ({
            name: acc.email === activeAccount?.email ? `${acc.email} (current)` : acc.email,
            value: acc.email
          }));

          const answer = await inquirer.prompt([
            {
              type: 'list',
              name: 'email',
              message: 'Select account:',
              choices
            }
          ]);

          selectedEmail = answer.email;
        }

        if (!selectedEmail) {
          Logger.error('No account selected');
          process.exit(1);
        }

        configManager.setActiveAccount(selectedEmail);
        Logger.success(`Selected account: ${selectedEmail}`);
      } catch (error) {
        Logger.error(`Failed to select account: ${error instanceof Error ? error.message : 'Unknown error'}`);
        process.exit(1);
      }
    });

  return command;
}
