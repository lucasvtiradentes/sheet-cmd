import type { Program as CaporalProgram } from '@caporal/core';
import { performOAuthFlow } from '../../auth/oauth-flow';
import { ConfigManager } from '../../config/config-manager';
import { createSubCommandFromSchema } from '../../definitions/command-builder';
import { CommandNames, SubCommandNames } from '../../definitions/types';
import { Logger } from '../../utils/logger';

export function createReauthAccountCommand(program: CaporalProgram): void {
  const accountReauthCommand = async () => {
    const configManager = new ConfigManager();
    const activeAccount = configManager.getActiveAccount();

    if (!activeAccount) {
      Logger.error('No active account set.');
      Logger.info('Use: sheet-cmd account switch <email>');
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
  };

  createSubCommandFromSchema(
    program,
    CommandNames.ACCOUNT,
    SubCommandNames.ACCOUNT_REAUTH,
    accountReauthCommand,
    'Failed to re-authenticate account'
  );
}
