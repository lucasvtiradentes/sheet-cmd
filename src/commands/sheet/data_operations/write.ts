import { Command } from 'commander';
import { getActiveSheetName, getGoogleSheetsService } from '../../../core/command-helpers.js';
import { createSubCommandFromSchema } from '../../../definitions/command-builder.js';
import type { SheetWriteOptions } from '../../../definitions/command-types.js';
import { CommandNames, SubCommandNames } from '../../../definitions/types.js';
import { columnLetterToNumber } from '../../../utils/cell.js';
import { Logger } from '../../../utils/logger.js';

export function createWriteCommand(): Command {
  return createSubCommandFromSchema(
    CommandNames.SHEET,
    SubCommandNames.SHEET_WRITE,
    async (options: SheetWriteOptions) => {
      try {
        if (!options.cell && !options.range) {
          Logger.error('Either --cell or --range must be specified');
          process.exit(1);
        }

        if (options.cell && options.range) {
          Logger.error('Cannot use both --cell and --range at the same time');
          process.exit(1);
        }

        const sheetsService = await getGoogleSheetsService();
        const sheetName = getActiveSheetName(options.name);

        if (options.cell) {
          Logger.loading(`Writing to cell ${options.cell}...`);
          await sheetsService.writeCell(sheetName, options.cell, options.value);
          Logger.success(`Cell ${options.cell} updated successfully`);
        } else if (options.range) {
          let values: any[][];

          if (options.value.trim().startsWith('[')) {
            try {
              values = JSON.parse(options.value);
              if (!Array.isArray(values) || !Array.isArray(values[0])) {
                throw new Error('Value must be a 2D array');
              }
            } catch (_error) {
              Logger.error('Invalid JSON array format. Expected 2D array like [["a","b"],["c","d"]]');
              process.exit(1);
            }
          } else {
            const rows = options.value.split(';').map((row) => row.trim());
            values = rows.map((row) =>
              row.split(',').map((cell) => {
                const trimmed = cell.trim();
                const numericValue = trimmed.replace(',', '.');
                if (!Number.isNaN(Number(numericValue)) && numericValue !== '') {
                  return Number(numericValue);
                }
                return trimmed;
              })
            );
          }

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
              const actualCols = Math.max(...values.map((row) => row.length));

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

          // Commander.js converts --no-preserve flag to preserve: false
          // We need to invert it to get noPreserve: true when flag is present
          const noPreserve = options.preserve === false;
          Logger.loading(`Writing to range ${options.range}...`);
          await sheetsService.writeCellRange(sheetName, options.range, values, noPreserve);
          Logger.success(`Range ${options.range} updated successfully`);
        }
      } catch (error) {
        Logger.error('Failed to write cell(s)', error);
        process.exit(1);
      }
    }
  );
}
