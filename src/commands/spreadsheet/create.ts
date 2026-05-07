import { defineSubCommand, flag } from '../../cli/define';
import { ConfigManager } from '../../config/config-manager';
import { getProgramName } from '../../config/constants';
import { GoogleDriveService } from '../../core/google-drive.service';
import { Logger } from '../../utils/logger';
import { getSpreadsheetUrl } from '../../utils/spreadsheet';

export const createSpreadsheetCommand = defineSubCommand({
  name: 'create',
  description: 'Create a new Google spreadsheet and add it to local config',
  flags: [
    flag.string('--name', 'Spreadsheet name', { alias: '-n', required: true }),
    flag.string('--local-name', 'Local config name for the spreadsheet'),
    flag.boolean('--no-select', 'Do not set the created spreadsheet as active')
  ],
  errorMessage: 'Failed to create spreadsheet',
  action: async ({ options }) => {
    const configManager = new ConfigManager();
    const activeAccount = configManager.getActiveAccount();

    if (!activeAccount) {
      Logger.error('No active account set.');
      Logger.info(`Use: ${getProgramName()} account add`);
      process.exit(1);
    }

    const credentials = await configManager.getRefreshedCredentials(activeAccount.email);
    const driveService = new GoogleDriveService(credentials);
    const spreadsheet = await driveService.createSpreadsheet(options.name);
    const localName = options.localName?.trim() || spreadsheet.name;

    await configManager.addSpreadsheet(activeAccount.email, localName, spreadsheet.id);

    if (options.select !== false) {
      configManager.setActiveSpreadsheet(activeAccount.email, localName);
    }

    Logger.success(`Created spreadsheet: ${spreadsheet.name}`);
    Logger.dim(`  Local name: ${localName}`);
    Logger.dim(`  ID: ${spreadsheet.id}`);
    Logger.dim(`  URL: ${spreadsheet.webViewLink || getSpreadsheetUrl(spreadsheet.id)}`);
    if (options.select !== false) {
      Logger.dim('  Active: yes');
    }
  }
});
