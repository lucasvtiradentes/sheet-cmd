import inquirer from 'inquirer';
import { ConfigManager } from '../../../config/config-manager';
import { GOOGLE_API_URLS } from '../../../config/constants';
import { GoogleDriveService } from '../../../core/google-drive.service';
import { Logger } from '../../../utils/logger';
import { parseSpreadsheetId } from '../../../utils/spreadsheet';
import { defineSubCommand, flag } from '../../define';
import { getSpreadsheetTitle } from './helpers';

export const addSpreadsheetCommand = defineSubCommand({
  name: 'add',
  description: 'Add a new spreadsheet (interactive by default, use --id for manual)',
  flags: [
    flag.string('--id', 'Spreadsheet ID or URL (skips interactive selection)'),
    flag.string('--name', 'Local name for the spreadsheet')
  ],
  errorMessage: 'Failed to add spreadsheet',
  action: async ({ options }) => {
    const configManager = new ConfigManager();
    const activeAccount = configManager.getActiveAccount();

    if (!activeAccount) {
      Logger.error('No active account set.');
      Logger.info('Use: sheet-cmd account add');
      process.exit(1);
    }

    let spreadsheetId: string;
    let name: string;

    if (options.id) {
      spreadsheetId = parseSpreadsheetId(options.id);
      name = options.name?.trim() || '';

      if (!name) {
        const defaultName = await getSpreadsheetTitle(configManager, activeAccount.email, spreadsheetId);
        const answer = await inquirer.prompt([
          {
            type: 'input',
            name: 'name',
            message: 'Enter a local name for this spreadsheet:',
            default: defaultName,
            validate: (input: string) => {
              if (!input.trim()) {
                return 'Name cannot be empty';
              }
              return true;
            }
          }
        ]);

        name = answer.name;
      }
    } else {
      Logger.loading('Fetching your spreadsheets from Google Drive...');

      const credentials = await configManager.getRefreshedCredentials(activeAccount.email);
      const driveService = new GoogleDriveService(credentials);
      const spreadsheets = await driveService.listSpreadsheets();

      if (spreadsheets.length === 0) {
        Logger.warning('No spreadsheets found in your Google Drive.');
        Logger.info(`Create one at: ${GOOGLE_API_URLS.SHEETS_CREATE}`);
        process.exit(0);
      }

      const choices = spreadsheets.map((s) => ({
        name: `${s.name} (Modified: ${new Date(s.modifiedTime).toLocaleDateString()})`,
        value: { id: s.id, name: s.name }
      }));

      const selection = await inquirer.prompt([
        {
          type: 'list',
          name: 'spreadsheet',
          message: `Select a spreadsheet (${spreadsheets.length} found):`,
          choices,
          pageSize: 15
        },
        {
          type: 'input',
          name: 'localName',
          message: 'Enter a local name for this spreadsheet:',
          default: (answers: any) => answers.spreadsheet.name,
          validate: (input: string) => {
            if (!input.trim()) {
              return 'Name cannot be empty';
            }
            return true;
          }
        }
      ]);

      spreadsheetId = selection.spreadsheet.id;
      name = selection.localName;
    }

    await configManager.addSpreadsheet(activeAccount.email, name, spreadsheetId);

    const spreadsheets = configManager.listSpreadsheets(activeAccount.email);
    if (spreadsheets.length === 1) {
      configManager.setActiveSpreadsheet(activeAccount.email, name);
      Logger.success(`Spreadsheet '${name}' added and set as active!`);
    } else {
      Logger.success(`Spreadsheet '${name}' added successfully!`);
      Logger.info(`Switch to this spreadsheet: sheet-cmd spreadsheet select ${name}`);
    }
  }
});
