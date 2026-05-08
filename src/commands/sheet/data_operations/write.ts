import { readFileSync } from 'node:fs';
import { defineSubCommand, flag } from '../../../cli/define';
import { getActiveSheetName, getGoogleSheetsService } from '../../../core/command-helpers';
import { columnLetterToNumber, rangeFromStartCell } from '../../../utils/cell';
import { Logger } from '../../../utils/logger';
import { type CellValue, inferCellType, inferTableTypes } from '../../../utils/type-inference';

function parseJsonTable(value: string, inferTypes: boolean): CellValue[][] | null {
  if (!value.trim().startsWith('[')) return null;

  try {
    const values = JSON.parse(value);
    if (!Array.isArray(values) || !Array.isArray(values[0])) {
      throw new Error('Value must be a 2D array');
    }
    return inferTypes ? inferTableTypes(values) : values;
  } catch (_error) {
    Logger.error('Invalid JSON array format. Expected 2D array like [["a","b"],["c","d"]]');
    process.exit(1);
  }
}

function parseDelimitedTable(value: string, inferTypes: boolean): CellValue[][] {
  const rows = value.split(';').map((row) => row.trim());
  return rows.map((row) =>
    row.split(',').map((cell) => {
      const trimmed = cell.trim();
      return inferTypes ? inferCellType(trimmed) : trimmed;
    })
  );
}

export const writeCommand = defineSubCommand({
  name: 'write',
  description: 'Write to a specific cell or range of cells',
  flags: [
    flag.string('--name', 'Tab name (uses active if not provided)', { alias: '-n' }),
    flag.string('--cell', 'Cell address or table start cell (e.g., A1) - required if --range not provided', {
      alias: '-c'
    }),
    flag.string('--initial-cell', 'Start cell for table values (e.g., A1)'),
    flag.string('--range', 'Range (e.g., A1:B2) - required if --cell not provided', { alias: '-r' }),
    flag.string('--value', 'Value to write (use , for columns, ; for rows)', { alias: '-v' }),
    flag.string('--value-file', 'Read the value to write from a file'),
    flag.boolean('--no-infer-types', 'Keep values as text without numeric type inference'),
    flag.boolean('--no-preserve', 'Overwrite cells with formulas or data validation')
  ],
  errorMessage: 'Failed to write to sheet',
  action: async ({ options }) => {
    if (!options.cell && !options.initialCell && !options.range) {
      Logger.error('Either --cell, --initial-cell, or --range must be specified');
      process.exit(1);
    }

    const locationCount = [options.cell, options.initialCell, options.range].filter(Boolean).length;
    if (locationCount > 1) {
      Logger.error('Use only one of --cell, --initial-cell, or --range');
      process.exit(1);
    }

    if (!options.value && !options.valueFile) {
      Logger.error('Either --value or --value-file must be specified');
      process.exit(1);
    }

    if (options.value && options.valueFile) {
      Logger.error('Cannot use both --value and --value-file at the same time');
      process.exit(1);
    }

    const value = options.valueFile ? readFileSync(options.valueFile, 'utf-8') : options.value;
    const sheetsService = await getGoogleSheetsService();
    const sheetName = getActiveSheetName(options.name);
    const inferTypes = options.inferTypes !== false;
    const jsonTable = parseJsonTable(value, inferTypes);
    const startCell = options.initialCell ?? options.cell;

    if (startCell) {
      if (jsonTable) {
        const actualRows = jsonTable.length;
        const actualCols = jsonTable.reduce((max, row) => Math.max(max, row.length), 0);
        const range = rangeFromStartCell(startCell, actualRows, actualCols);

        if (!range) {
          Logger.error(`Invalid cell address: ${startCell}`);
          process.exit(1);
        }

        const noPreserve = options.preserve === false;
        Logger.loading(`Writing to range ${range}...`);
        await sheetsService.writeCellRange(sheetName, range, jsonTable, noPreserve);
        Logger.success(`Range ${range} updated successfully`);
      } else {
        Logger.loading(`Writing to cell ${startCell}...`);
        await sheetsService.writeCell(sheetName, startCell, value);
        Logger.success(`Cell ${startCell} updated successfully`);
      }
    } else if (options.range) {
      const values = jsonTable ?? parseDelimitedTable(value, inferTypes);

      const rangeParts = options.range.split(':');
      if (rangeParts.length === 2) {
        const [startCell, endCell] = rangeParts;

        const startMatch = startCell.match(/^([A-Z]+)(\d+)$/);
        const endMatch = endCell.match(/^([A-Z]+)(\d+)$/);

        if (startMatch && endMatch) {
          const startRow = parseInt(startMatch[2], 10);
          const endRow = parseInt(endMatch[2], 10);
          const startCol = startMatch[1];
          const endCol = endMatch[1];

          const expectedRows = endRow - startRow + 1;
          const expectedCols = columnLetterToNumber(endCol) - columnLetterToNumber(startCol) + 1;

          const actualRows = values.length;
          const actualCols = values.reduce((max, row) => Math.max(max, row.length), 0);

          if (actualRows !== expectedRows || actualCols !== expectedCols) {
            Logger.error(
              `Dimension mismatch: Range ${options.range} expects ${expectedRows}x${expectedCols} ` +
                `but got ${actualRows}x${actualCols} values`
            );
            Logger.info(`Tip: Provide ${expectedRows} rows with ${expectedCols} columns each`);
            process.exit(1);
          }
        }
      }

      // Caporal converts --no-preserve to preserve: false.
      const noPreserve = options.preserve === false;
      Logger.loading(`Writing to range ${options.range}...`);
      await sheetsService.writeCellRange(sheetName, options.range, values, noPreserve);
      Logger.success(`Range ${options.range} updated successfully`);
    }
  }
});
