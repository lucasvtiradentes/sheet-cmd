import { Command } from 'commander';
import * as readline from 'readline';
import { performOAuthFlow } from '../../auth/oauth-flow.js';
import { ConfigManager } from '../../config/config-manager.js';
import { GOOGLE_CLOUD_CONSOLE_URLS } from '../../config/constants.js';
import { Logger } from '../../utils/logger.js';

async function promptInput(question: string): Promise<string> {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      rl.close();
      resolve(answer.trim());
    });
  });
}

export function createAddAccountCommand(): Command {
  const command = new Command('add');

  command.description('Add a Google account via OAuth').action(async () => {
    try {
      Logger.bold('='.repeat(70));
      Logger.bold('  GOOGLE CLOUD CONSOLE SETUP');
      Logger.bold('='.repeat(70));
      Logger.plain('');
      Logger.info('Follow these steps to get OAuth credentials:\n');

      Logger.bold('STEP 1: Enable Required APIs');
      Logger.info('  a) Enable Google Sheets API:');
      Logger.link(`     ${GOOGLE_CLOUD_CONSOLE_URLS.ENABLE_SHEETS_API}`);
      Logger.info('  b) Enable Google Drive API:');
      Logger.link(`     ${GOOGLE_CLOUD_CONSOLE_URLS.ENABLE_DRIVE_API}`);
      Logger.plain('');

      Logger.bold('STEP 2: Configure OAuth Consent Screen');
      Logger.link(`  ${GOOGLE_CLOUD_CONSOLE_URLS.CONSENT_SCREEN}`);
      Logger.info('  - User Type: External');
      Logger.info('  - Fill app name, support email, developer email');
      Logger.info('  - Add test users: YOUR EMAIL ADDRESS');
      Logger.plain('');

      Logger.bold('STEP 3: Add Required Scopes');
      Logger.link(`  ${GOOGLE_CLOUD_CONSOLE_URLS.SCOPES}`);
      Logger.info('  Click "ADD OR REMOVE SCOPES" and add:');
      Logger.info('  - .../auth/spreadsheets (View and manage your Google Sheets)');
      Logger.info('  - .../auth/drive.readonly (View your Google Drive files)');
      Logger.plain('');

      Logger.bold('STEP 4: Create OAuth 2.0 Client ID');
      Logger.link(`  ${GOOGLE_CLOUD_CONSOLE_URLS.CREDENTIALS}`);
      Logger.info('  - Click "CREATE CREDENTIALS" → "OAuth client ID"');
      Logger.info('  - Application type: Desktop app');
      Logger.info('  - Name: sheet-cmd (or any name you prefer)');
      Logger.info('  - Copy Client ID and Client Secret');
      Logger.plain('');

      Logger.bold('='.repeat(70));
      Logger.plain('');

      const clientId = await promptInput('Enter OAuth Client ID: ');
      if (!clientId) {
        Logger.error('Client ID is required');
        process.exit(1);
      }

      const clientSecret = await promptInput('Enter OAuth Client Secret: ');
      if (!clientSecret) {
        Logger.error('Client Secret is required');
        process.exit(1);
      }

      Logger.info('\nStarting OAuth authentication flow...');

      const result = await performOAuthFlow(clientId, clientSecret);

      const configManager = new ConfigManager();
      await configManager.addAccount(result.email, result.credentials);

      const accounts = configManager.getAllAccounts();
      if (accounts.length === 1) {
        configManager.setActiveAccount(result.email);
        Logger.success(`Account '${result.email}' added and set as active!`);
      } else {
        Logger.success(`Account '${result.email}' added successfully!`);
        Logger.info(`Switch to this account: sheet-cmd account switch ${result.email}`);
      }
    } catch (error) {
      Logger.error(`Failed to add account: ${error instanceof Error ? error.message : 'Unknown error'}`);
      process.exit(1);
    }
  });

  return command;
}
