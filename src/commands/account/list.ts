import { defineSubCommand } from '../../cli/define';
import { ConfigManager } from '../../config/config-manager';
import { Logger } from '../../utils/logger';

export const listAccountsCommand = defineSubCommand({
  name: 'list',
  description: 'List all configured Google accounts',
  errorMessage: 'Failed to list accounts',
  action: () => {
    const configManager = new ConfigManager();
    const accounts = configManager.getAllAccounts();
    const activeAccountEmail = configManager.getActiveAccountEmail();

    if (accounts.length === 0) {
      Logger.info('No accounts configured.');
      Logger.info('Add one with: sheet-cmd account add');
      return;
    }

    Logger.info('Configured accounts:');
    accounts.forEach((account) => {
      const isActive = account.email === activeAccountEmail;
      const spreadsheetCount = Object.keys(account.spreadsheets).length;
      const prefix = isActive ? '->' : '  ';
      Logger.info(`${prefix} ${account.email} (${spreadsheetCount} spreadsheet${spreadsheetCount !== 1 ? 's' : ''})`);
    });
  }
});
