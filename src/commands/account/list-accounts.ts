import { Command } from 'commander';
import { ConfigManager } from '../../config/config-manager.js';
import { createSubCommandFromSchema } from '../../definitions/command-builder.js';
import { CommandNames, SubCommandNames } from '../../definitions/types.js';
import { Logger } from '../../utils/logger.js';

export function createListAccountsCommand(): Command {
  const accountListCommand = () => {
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
  };

  return createSubCommandFromSchema(
    CommandNames.ACCOUNT,
    SubCommandNames.ACCOUNT_LIST,
    accountListCommand,
    'Failed to list accounts'
  );
}
