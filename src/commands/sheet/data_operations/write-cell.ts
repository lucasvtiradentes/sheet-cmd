import { Command } from 'commander';

import { getGoogleSheetsService } from '../../../core/command-helpers.js';
import { columnLetterToNumber } from '../../../utils/cell-utils.js';
import { Logger } from '../../../utils/logger.js';

export function createWriteCellCommand(): Command {
  return new Command('write-cell')
    .description('Write to a specific cell or range of cells')
    .requiredOption('-n, --name <name>', 'Sheet name')
    .option('-c, --cell <cell>', 'Single cell (e.g., A1)')
    .option('-r, --range <range>', 'Cell range (e.g., A1:B2)')
    .requiredOption('-v, --value <value>', 'Value to write (for range: use comma for columns, semicolon for rows)')
    .option('-s, --spreadsheet <name>', 'Spreadsheet name (uses active spreadsheet if not specified)')
    .action(async (options: { name: string; cell?: string; range?: string; value: string; spreadsheet?: string }) => {
      try {
        if (!options.cell && !options.range) {
          Logger.error('Either --cell or --range must be specified');
          process.exit(1);
        }

        if (options.cell && options.range) {
          Logger.error('Cannot use both --cell and --range at the same time');
          process.exit(1);
        }

        const sheetsService = await getGoogleSheetsService(options.spreadsheet);

        if (options.cell) {
          Logger.loading(`Writing to cell ${options.cell}...`);
          await sheetsService.writeCell(options.name, options.cell, options.value);
          Logger.success(`Cell ${options.cell} updated successfully`);
        } else if (options.range) {
          // Parse value: semicolon separates rows, comma separates columns
          // Example: "val1, val2; val3, val4" -> [["val1", "val2"], ["val3", "val4"]]
          const rows = options.value.split(';').map((row) => row.trim());
          const values = rows.map((row) => row.split(',').map((cell) => cell.trim()));

          // Validate range dimensions match the provided values
          const rangeParts = options.range.split(':');
          if (rangeParts.length === 2) {
            const [startCell, endCell] = rangeParts;

            // Extract row and column from cells (e.g., "A1" -> row=1, col=A)
            const startMatch = startCell.match(/^([A-Z]+)(\d+)$/);
            const endMatch = endCell.match(/^([A-Z]+)(\d+)$/);

            if (startMatch && endMatch) {
              const startRow = parseInt(startMatch[2], 10);
              const endRow = parseInt(endMatch[2], 10);
              const startCol = startMatch[1];
              const endCol = endMatch[1];

              // Calculate expected dimensions
              const expectedRows = endRow - startRow + 1;
              const expectedCols = columnLetterToNumber(endCol) - columnLetterToNumber(startCol) + 1;

              // Get actual dimensions
              const actualRows = values.length;
              const actualCols = Math.max(...values.map((row) => row.length));

              // Validate dimensions
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

          Logger.loading(`Writing to range ${options.range}...`);
          await sheetsService.writeCellRange(options.name, options.range, values);
          Logger.success(`Range ${options.range} updated successfully`);
        }
      } catch (error) {
        Logger.error('Failed to write cell(s)', error);
        process.exit(1);
      }
    });
}
