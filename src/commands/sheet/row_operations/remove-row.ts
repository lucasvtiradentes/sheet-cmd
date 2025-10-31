import { Command } from 'commander';
import { getActiveSheetName, getGoogleSheetsService } from '../../../core/command-helpers.js';
import { createSubCommandFromSchema } from '../../../definitions/command-builder.js';
import type { RowRemoveOptions } from '../../../definitions/command-types.js';
import { CommandNames, SubCommandNames } from '../../../definitions/types.js';
import { Logger } from '../../../utils/logger.js';
import { validatePositiveInteger, validateRequired } from '../../../utils/validators.js';

export function createRowRemoveCommand(): Command {
  const rowRemoveCommand = async (options: RowRemoveOptions) => {
      const rowValue = validateRequired(options.row, 'Row number');
      const rowNumber = validatePositiveInteger(rowValue, 'Row number');

      if (options.above && options.below) {
        Logger.error('Cannot use both --above and --below. Choose one');
        process.exit(1);
      }

      const count = options.count ? validatePositiveInteger(options.count, 'Count') : 1;

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
    };

  return createSubCommandFromSchema(
    CommandNames.SHEET,
    SubCommandNames.ROW_REMOVE,
    rowRemoveCommand,
    'Failed to remove row'
  );
}
