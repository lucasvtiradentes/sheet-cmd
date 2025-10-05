import { Command } from 'commander';

import { ConfigManager } from '../../../lib/config-manager.js';
import { GoogleSheetsService } from '../../../lib/google-sheets.service.js';
import { Logger } from '../../../lib/logger.js';

export function createAddTabCommand(): Command {
  return new Command('add-tab')
    .description('Add a new tab/sheet to the spreadsheet')
    .requiredOption('-t, --tab <name>', 'Tab/sheet name to create')
    .option('-s, --spreadsheet <name>', 'Spreadsheet name (uses active spreadsheet if not specified)')
    .action(async (options: { tab: string; spreadsheet?: string }) => {
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

        Logger.loading(`Creating tab '${options.tab}'...`);
        await sheetsService.addSheet(options.tab);

        Logger.success(`Tab '${options.tab}' created successfully`);
      } catch (error) {
        Logger.error('Failed to add tab', error);
        process.exit(1);
      }
    });
}
