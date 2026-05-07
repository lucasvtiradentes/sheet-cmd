import inquirer from 'inquirer';
import { argument, defineSubCommand } from '../../cli/define';
import { ConfigManager } from '../../config/config-manager';
import { Logger } from '../../utils/logger';

export const removeAccountCommand = defineSubCommand({
  name: 'remove',
  description: 'Remove a Google account',
  arguments: [argument.string('email', 'Account email to remove (optional - interactive if not provided)')],
  errorMessage: 'Failed to remove account',
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
  }
});
