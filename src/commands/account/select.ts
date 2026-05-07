import inquirer from 'inquirer';
import { argument, defineSubCommand } from '../../cli/define';
import { ConfigManager } from '../../config/config-manager';
import { Logger } from '../../utils/logger';

export const selectAccountCommand = defineSubCommand({
  name: 'select',
  description: 'Select active Google account',
  arguments: [argument.string('email', 'Account email to select (optional - interactive if not provided)')],
  errorMessage: 'Failed to select account',
  action: async ({ args }) => {
    const configManager = new ConfigManager();
    const accounts = configManager.getAllAccounts();

    if (accounts.length === 0) {
      Logger.warning('No accounts configured.');
      Logger.info('Use: gsheet account add');
      process.exit(0);
    }

    let selectedEmail = args.email;

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
  }
});
