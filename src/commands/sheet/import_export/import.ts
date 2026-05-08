import { readFileSync } from 'fs';
import { defineSubCommand, flag } from '../../../cli/define';
import { getActiveSheetName, getGoogleSheetsService } from '../../../core/command-helpers';
import { rangeFromStartCell } from '../../../utils/cell';
import { parseCSV } from '../../../utils/csv';
import { Logger } from '../../../utils/logger';
import { inferTableTypes } from '../../../utils/type-inference';

export const importCommand = defineSubCommand({
  name: 'import',
  description: 'Import CSV file to a sheet',
  flags: [
    flag.string('--name', 'Tab name (uses active if not provided)', { alias: '-n' }),
    flag.string('--file', 'CSV file path', { alias: '-f', required: true }),
    flag.string('--initial-cell', 'Start cell for imported values (default: A1)'),
    flag.boolean('--skip-header', 'Skip header row when importing'),
    flag.boolean('--no-infer-types', 'Keep CSV values as text instead of inferring exact numeric strings')
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

    const columnCount = dataToImport.reduce((max, row) => Math.max(max, row.length), 0);
    if (columnCount === 0) {
      Logger.warning('No columns found in CSV file');
      process.exit(0);
    }

    const normalizedData = dataToImport.map((row) =>
      Array.from({ length: columnCount }, (_, index) => row[index] ?? '')
    );
    const values = options.inferTypes === false ? normalizedData : inferTableTypes(normalizedData);
    const initialCell = options.initialCell ?? 'A1';
    const range = rangeFromStartCell(initialCell, normalizedData.length, columnCount);

    if (!range) {
      Logger.error(`Invalid initial cell address: ${initialCell}`);
      process.exit(1);
    }

    await sheetsService.writeRawCellRange(sheetName, range, values);

    Logger.success(`Successfully imported ${dataToImport.length} rows to '${sheetName}'`);
  }
});
