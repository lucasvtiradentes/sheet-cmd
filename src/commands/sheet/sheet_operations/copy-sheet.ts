import { Command } from 'commander';

import { ConfigManager } from '../../../lib/config-manager.js';
import { GoogleSheetsService } from '../../../lib/google-sheets.service.js';
import { Logger } from '../../../lib/logger.js';

export function createCopySheetCommand(): Command {
  return new Command('copy-sheet')
    .description('Copy a sheet to a new sheet')
    .requiredOption('-n, --name <name>', 'Sheet name to copy')
    .requiredOption('--to <name>', 'New sheet name')
    .option('-s, --spreadsheet <name>', 'Spreadsheet name (uses active spreadsheet if not specified)')
    .action(async (options: { name: string; to: string; spreadsheet?: string }) => {
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

        Logger.loading(`Copying sheet '${options.name}' to '${options.to}'...`);
        await sheetsService.copySheet(options.name, options.to);

        Logger.success(`Sheet '${options.name}' copied to '${options.to}' successfully`);
      } catch (error) {
        Logger.error('Failed to copy sheet', error);
        process.exit(1);
      }
    });
}
