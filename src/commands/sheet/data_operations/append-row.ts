import { Command } from 'commander';

import { ConfigManager } from '../../../lib/config-manager.js';
import { GoogleSheetsService } from '../../../lib/google-sheets.service.js';
import { Logger } from '../../../lib/logger.js';

export function createAppendRowCommand(): Command {
  return new Command('append-row')
    .description('Append a new row to the end of the sheet')
    .requiredOption('-t, --tab <name>', 'Tab/sheet name')
    .requiredOption('-v, --values <values>', 'Comma-separated values for the row')
    .option('-s, --spreadsheet <name>', 'Spreadsheet name (uses active spreadsheet if not specified)')
    .action(async (options: { tab: string; values: string; spreadsheet?: string }) => {
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

        // Parse comma-separated values
        const values = options.values.split(',').map(v => v.trim());

        Logger.loading(`Appending row to '${options.tab}'...`);
        await sheetsService.appendRow(options.tab, values);

        Logger.success(`Row appended to '${options.tab}' successfully`);
      } catch (error) {
        Logger.error('Failed to append row', error);
        process.exit(1);
      }
    });
}
