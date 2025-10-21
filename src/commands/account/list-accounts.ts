import { Command } from 'commander';
import { ConfigManager } from '../../lib/config-manager.js';
import { Logger } from '../../lib/logger.js';

export function createListAccountsCommand(): Command {
  const command = new Command('list');

  command
    .description('List all configured Google accounts')
    .action(() => {
      try {
        const configManager = new ConfigManager();
        const accounts = configManager.getAllAccounts();
        const activeAccountEmail = configManager.getActiveAccountEmail();

        if (accounts.length === 0) {
          Logger.info('No accounts configured.');
          Logger.info('Add one with: sheet-cmd account add');
          return;
        }

        Logger.info('Configured accounts:\n');
        accounts.forEach((account) => {
          const isActive = account.email === activeAccountEmail;
          const marker = isActive ? '*' : ' ';
          const spreadsheetCount = Object.keys(account.spreadsheets).length;
          Logger.info(`${marker} ${account.email} (${spreadsheetCount} spreadsheet${spreadsheetCount !== 1 ? 's' : ''})`);
        });

        if (activeAccountEmail) {
          Logger.info(`\n* = active account`);
        }
      } catch (error) {
        Logger.error(`Failed to list accounts: ${error instanceof Error ? error.message : 'Unknown error'}`);
        process.exit(1);
      }
    });

  return command;
}
