import { Command } from 'commander';
import { getActiveSheetName, getGoogleSheetsService } from '../../../core/command-helpers.js';
import { createSubCommandFromSchema } from '../../../definitions/command-builder.js';
import type { RowRemoveOptions } from '../../../definitions/command-types.js';
import { CommandNames, SubCommandNames } from '../../../definitions/types.js';
import { Logger } from '../../../utils/logger.js';

export function createRowRemoveCommand(): Command {
  return createSubCommandFromSchema(
    CommandNames.SHEET,
    SubCommandNames.ROW_REMOVE,
    async (options: RowRemoveOptions) => {
      try {
        if (!options.row) {
          Logger.error('Row number is required. Use --row <number>');
          process.exit(1);
        }

        const rowNumber = parseInt(options.row, 10);
        if (isNaN(rowNumber) || rowNumber < 1) {
          Logger.error('Row number must be a positive integer');
          process.exit(1);
        }

        if (options.above && options.below) {
          Logger.error('Cannot use both --above and --below. Choose one.');
          process.exit(1);
        }

        const count = options.count ? parseInt(options.count, 10) : 1;
        if (isNaN(count) || count < 1) {
          Logger.error('Count must be a positive integer');
          process.exit(1);
        }

        const sheetsService = await getGoogleSheetsService();
        const sheetName = getActiveSheetName(options.name);

        let startIndex: number;
        let endIndex: number;

        if (options.above) {
          startIndex = rowNumber - count - 1;
          endIndex = rowNumber - 1;
          if (startIndex < 0) {
            Logger.error(`Cannot remove ${count} rows above row ${rowNumber} (would go above row 1)`);
            process.exit(1);
          }
        } else if (options.below) {
          startIndex = rowNumber;
          endIndex = rowNumber + count;
        } else {
          startIndex = rowNumber - 1;
          endIndex = rowNumber + count - 1;
        }

        const rowWord = count === 1 ? 'row' : 'rows';
        const direction = options.above ? 'above' : options.below ? 'below' : 'starting from';
        Logger.loading(`Removing ${count} ${rowWord} ${direction} row ${rowNumber}...`);

        await sheetsService.deleteRows(sheetName, {
          startIndex,
          endIndex
        });

        Logger.success(`${count} ${rowWord} removed successfully`);
      } catch (error) {
        Logger.error('Failed to remove row', error);
        process.exit(1);
      }
    }
  );
}
