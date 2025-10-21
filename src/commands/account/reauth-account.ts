import { Command } from 'commander';
import { ConfigManager } from '../../lib/config-manager.js';
import { Logger } from '../../lib/logger.js';
import { performOAuthFlow } from '../../lib/oauth-flow.js';

export function createReauthAccountCommand(): Command {
  const command = new Command('reauth');

  command
    .description('Re-authenticate the active account (refresh OAuth tokens)')
    .action(async () => {
      try {
        const configManager = new ConfigManager();
        const activeAccount = configManager.getActiveAccount();

        if (!activeAccount) {
          Logger.error('No active account set.');
          Logger.info('Use: sheet-cmd account switch <email>');
          process.exit(1);
        }

        Logger.info(`Re-authenticating account: ${activeAccount.email}`);
        Logger.info('Opening browser for authentication...\n');

        const result = await performOAuthFlow(
          activeAccount.oauth.client_id,
          activeAccount.oauth.client_secret
        );

        if (result.email !== activeAccount.email) {
          Logger.error(`Authentication email mismatch. Expected ${activeAccount.email}, got ${result.email}`);
          process.exit(1);
        }

        await configManager.updateAccountCredentials(result.email, result.credentials);
        Logger.success(`Account '${result.email}' re-authenticated successfully!`);
      } catch (error) {
        Logger.error(`Failed to re-authenticate: ${error instanceof Error ? error.message : 'Unknown error'}`);
        process.exit(1);
      }
    });

  return command;
}
