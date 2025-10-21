import { Command } from 'commander';
import { ConfigManager } from '../../lib/config-manager.js';
import { Logger } from '../../lib/logger.js';

export function createRemoveAccountCommand(): Command {
  const command = new Command('remove');

  command
    .description('Remove a Google account and all its spreadsheets')
    .argument('<email>', 'Account email to remove')
    .action(async (email: string) => {
      try {
        const configManager = new ConfigManager();
        const account = configManager.getAccount(email);

        if (!account) {
          Logger.error(`Account '${email}' not found`);
          process.exit(1);
        }

        const spreadsheetCount = Object.keys(account.spreadsheets).length;
        if (spreadsheetCount > 0) {
          Logger.warning(
            `This will remove ${spreadsheetCount} spreadsheet${spreadsheetCount !== 1 ? 's' : ''} associated with this account.`
          );
        }

        await configManager.removeAccount(email);
        Logger.success(`Account '${email}' removed successfully`);
      } catch (error) {
        Logger.error(`Failed to remove account: ${error instanceof Error ? error.message : 'Unknown error'}`);
        process.exit(1);
      }
    });

  return command;
}
