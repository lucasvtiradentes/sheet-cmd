import { Command } from 'commander';
import { performOAuthFlow } from '../../auth/oauth-flow.js';
import { ConfigManager } from '../../config/config-manager.js';
import { createSubCommandFromSchema } from '../../definitions/command-builder.js';
import { CommandNames, SubCommandNames } from '../../definitions/types.js';
import { Logger } from '../../utils/logger.js';

export function createReauthAccountCommand(): Command {
  return createSubCommandFromSchema(CommandNames.ACCOUNT, SubCommandNames.ACCOUNT_REAUTH, async () => {
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

      const result = await performOAuthFlow(activeAccount.oauth.client_id, activeAccount.oauth.client_secret);

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
}
