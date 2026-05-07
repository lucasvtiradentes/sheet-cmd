import { readFileSync } from 'fs';
import { defineSubCommand, flag } from '../../../cli/define';
import { getActiveSheetName, getGoogleSheetsService } from '../../../core/command-helpers';
import { parseCSV } from '../../../utils/csv';
import { Logger } from '../../../utils/logger';

export const importCommand = defineSubCommand({
  name: 'import',
  description: 'Import CSV file to a sheet',
  flags: [
    flag.string('--name', 'Tab name (uses active if not provided)', { alias: '-n' }),
    flag.string('--file', 'CSV file path', { alias: '-f', required: true }),
    flag.boolean('--skip-header', 'Skip header row when importing')
  ],
  errorMessage: 'Failed to import data',
  action: async ({ options }) => {
    const sheetsService = await getGoogleSheetsService();
    const sheetName = getActiveSheetName(options.name);

    Logger.loading(`Reading CSV file '${options.file}'...`);
    const csvContent = readFileSync(options.file, 'utf-8');
    const data = parseCSV(csvContent);

    if (data.length === 0) {
      Logger.warning('CSV file is empty');
      process.exit(0);
    }

    const dataToImport = options.skipHeader ? data.slice(1) : data;

    if (dataToImport.length === 0) {
      Logger.warning('No data to import after skipping header');
      process.exit(0);
    }

    Logger.loading(`Importing ${dataToImport.length} rows to '${sheetName}'...`);

    if (options.skipHeader) {
      if (dataToImport.length > 0) {
        const firstRowRange = `A1:${String.fromCharCode(65 + dataToImport[0].length - 1)}1`;
        await sheetsService.writeCellRange(sheetName, firstRowRange, [dataToImport[0]]);

        for (let i = 1; i < dataToImport.length; i++) {
          await sheetsService.appendRow(sheetName, dataToImport[i]);
          if ((i + 1) % 10 === 0) {
            Logger.loading(`Imported ${i + 1}/${dataToImport.length} rows...`);
          }
        }
      }
    } else {
      if (data.length > 0) {
        const headerRange = `A1:${String.fromCharCode(65 + data[0].length - 1)}1`;
        await sheetsService.writeCellRange(sheetName, headerRange, [data[0]]);

        for (let i = 1; i < data.length; i++) {
          await sheetsService.appendRow(sheetName, data[i]);
          if ((i + 1) % 10 === 0) {
            Logger.loading(`Imported ${i + 1}/${data.length} rows...`);
          }
        }
      }
    }

    Logger.success(`Successfully imported ${dataToImport.length} rows to '${sheetName}'`);
  }
});
