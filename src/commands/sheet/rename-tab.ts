import { Command } from 'commander';

import { ConfigManager } from '../../lib/config-manager.js';
import { GoogleSheetsService } from '../../lib/google-sheets.service.js';
import { Logger } from '../../lib/logger.js';

export function createRenameTabCommand(): Command {
  return new Command('rename-tab')
    .description('Rename a tab/sheet in the spreadsheet')
    .requiredOption('-t, --tab <name>', 'Current tab/sheet name')
    .requiredOption('-n, --new-name <name>', 'New tab/sheet name')
    .option('-s, --spreadsheet <name>', 'Spreadsheet name (uses active spreadsheet if not specified)')
    .action(async (options: { tab: string; newName: string; spreadsheet?: string }) => {
      try {
        const configManager = new ConfigManager();

        let spreadsheetName = options.spreadsheet;

        if (!spreadsheetName) {
          const activeSpreadsheet = configManager.getActiveSpreadsheet();
          if (!activeSpreadsheet) {
            Logger.error('No spreadsheet specified and no active spreadsheet set.');
            Logger.info('Use --spreadsheet flag or run: sheet-cmd spreadsheet switch <name>');
            process.exit(1);
          }
          spreadsheetName = activeSpreadsheet.name;
        }

        const spreadsheet = configManager.getSpreadsheet(spreadsheetName);

        if (!spreadsheet) {
          Logger.error(`Spreadsheet '${spreadsheetName}' not found. Use "sheet-cmd spreadsheet add" to add one.`);
          process.exit(1);
        }

        const sheetsService = new GoogleSheetsService({
          spreadsheetId: spreadsheet.spreadsheet_id,
          serviceAccountEmail: spreadsheet.service_account_email,
          privateKey: spreadsheet.private_key
        });

        Logger.loading(`Renaming tab '${options.tab}' to '${options.newName}'...`);
        await sheetsService.renameSheet(options.tab, options.newName);

        Logger.success(`Tab '${options.tab}' renamed to '${options.newName}' successfully`);
      } catch (error) {
        Logger.error('Failed to rename tab', error);
        process.exit(1);
      }
    });
}
