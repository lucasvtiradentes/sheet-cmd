import { readFileSync } from 'fs';
import { Command } from 'commander';

import { ConfigManager } from '../../../lib/config-manager.js';
import { parseCSV } from '../../../lib/csv-parser.js';
import { GoogleSheetsService } from '../../../lib/google-sheets.service.js';
import { Logger } from '../../../lib/logger.js';

export function createImportCsvCommand(): Command {
  return new Command('import-csv')
    .description('Import CSV file to a sheet tab')
    .requiredOption('-t, --tab <name>', 'Tab/sheet name')
    .requiredOption('-f, --file <path>', 'CSV file path')
    .option('--skip-header', 'Skip the first row (header) when importing')
    .option('--clear', 'Clear existing data before importing')
    .option('-s, --spreadsheet <name>', 'Spreadsheet name (uses active spreadsheet if not specified)')
    .action(async (options: {
      tab: string;
      file: string;
      skipHeader?: boolean;
      clear?: boolean;
      spreadsheet?: string
    }) => {
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

        // Read and parse CSV
        Logger.loading(`Reading CSV file '${options.file}'...`);
        const csvContent = readFileSync(options.file, 'utf-8');
        const data = parseCSV(csvContent);

        if (data.length === 0) {
          Logger.warning('CSV file is empty');
          process.exit(0);
        }

        // Skip header if requested
        const dataToImport = options.skipHeader ? data.slice(1) : data;

        if (dataToImport.length === 0) {
          Logger.warning('No data to import after skipping header');
          process.exit(0);
        }

        Logger.loading(`Importing ${dataToImport.length} rows to '${options.tab}'...`);

        // If we're not skipping headers, write the first row as headers using writeCellRange
        const startIndex = options.skipHeader ? 0 : 1;

        if (!options.skipHeader && data.length > 0) {
          // Write first row (headers) using writeCellRange
          const headerRange = `A1:${String.fromCharCode(65 + data[0].length - 1)}1`;
          await sheetsService.writeCellRange(options.tab, headerRange, [data[0]]);
        }

        // Import remaining rows one by one
        for (let i = startIndex; i < dataToImport.length; i++) {
          await sheetsService.appendRow(options.tab, dataToImport[i]);
          if ((i + 1) % 10 === 0) {
            Logger.loading(`Imported ${i + 1}/${dataToImport.length} rows...`);
          }
        }

        Logger.success(`Successfully imported ${dataToImport.length} rows to '${options.tab}'`);
      } catch (error) {
        Logger.error('Failed to import CSV', error);
        process.exit(1);
      }
    });
}
