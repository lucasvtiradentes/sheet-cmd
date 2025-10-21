import { Command } from 'commander';
import { readFileSync } from 'fs';
import { getGoogleSheetsService } from '../../../core/command-helpers.js';
import { createSubCommandFromSchema } from '../../../definitions/command-builder.js';
import type { SheetImportOptions } from '../../../definitions/command-types.js';
import { CommandNames, SubCommandNames } from '../../../definitions/types.js';
import { parseCSV } from '../../../utils/csv.js';
import { Logger } from '../../../utils/logger.js';

export function createImportCommand(): Command {
  return createSubCommandFromSchema(
    CommandNames.SHEET,
    SubCommandNames.SHEET_IMPORT,
    async (options: SheetImportOptions) => {
      try {
        const sheetsService = await getGoogleSheetsService();

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

        Logger.loading(`Importing ${dataToImport.length} rows to '${options.name}'...`);

        if (options.skipHeader) {
          if (dataToImport.length > 0) {
            const firstRowRange = `A1:${String.fromCharCode(65 + dataToImport[0].length - 1)}1`;
            await sheetsService.writeCellRange(options.name, firstRowRange, [dataToImport[0]]);

            for (let i = 1; i < dataToImport.length; i++) {
              await sheetsService.appendRow(options.name, dataToImport[i]);
              if ((i + 1) % 10 === 0) {
                Logger.loading(`Imported ${i + 1}/${dataToImport.length} rows...`);
              }
            }
          }
        } else {
          if (data.length > 0) {
            const headerRange = `A1:${String.fromCharCode(65 + data[0].length - 1)}1`;
            await sheetsService.writeCellRange(options.name, headerRange, [data[0]]);

            for (let i = 1; i < data.length; i++) {
              await sheetsService.appendRow(options.name, data[i]);
              if ((i + 1) % 10 === 0) {
                Logger.loading(`Imported ${i + 1}/${data.length} rows...`);
              }
            }
          }
        }

        Logger.success(`Successfully imported ${dataToImport.length} rows to '${options.name}'`);
      } catch (error) {
        Logger.error('Failed to import CSV', error);
        process.exit(1);
      }
    }
  );
}
