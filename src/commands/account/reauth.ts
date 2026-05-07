import { performOAuthFlow } from '../../auth/oauth-flow';
import { defineSubCommand } from '../../cli/define';
import { ConfigManager } from '../../config/config-manager';
import { getProgramName } from '../../config/constants';
import { Logger } from '../../utils/logger';

export const reauthAccountCommand = defineSubCommand({
  name: 'reauth',
  description: 'Re-authenticate the active account',
  errorMessage: 'Failed to re-authenticate account',
  action: async () => {
    const configManager = new ConfigManager();
    const activeAccount = configManager.getActiveAccount();

    if (!activeAccount) {
      Logger.error('No active account set.');
      Logger.info(`Use: ${getProgramName()} account select`);
      process.exit(1);
    }

    Logger.info(`Re-authenticating account: ${activeAccount.email}`);
    Logger.info('Opening browser for authentication...\n');

    const result = await performOAuthFlow(activeAccount.oauth.client_id, activeAccount.oauth.client_secret, {
      loginHint: activeAccount.email
    });

    if (result.email !== activeAccount.email) {
      Logger.error(`Authentication email mismatch. Expected ${activeAccount.email}, got ${result.email}`);
      process.exit(1);
    }

    await configManager.updateAccountCredentials(result.email, result.credentials);
    Logger.success(`Account '${result.email}' re-authenticated successfully!`);
    process.exit(0);
  }
});
