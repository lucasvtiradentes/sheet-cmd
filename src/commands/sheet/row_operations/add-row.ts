import { Command } from 'commander';
import { getActiveSheetName, getGoogleSheetsService } from '../../../core/command-helpers.js';
import { createSubCommandFromSchema } from '../../../definitions/command-builder.js';
import type { RowAddOptions } from '../../../definitions/command-types.js';
import { CommandNames, SubCommandNames } from '../../../definitions/types.js';
import { Logger } from '../../../utils/logger.js';
import { validatePositiveInteger, validateRequired } from '../../../utils/validators.js';

export function createRowAddCommand(): Command {
  const rowAddCommand = async (options: RowAddOptions) => {
    const rowValue = validateRequired(options.row, 'Row number');
    const rowNumber = validatePositiveInteger(rowValue, 'Row number');

    if (options.above && options.below) {
      Logger.error('Cannot use both --above and --below. Choose one');
      process.exit(1);
    }

    const count = options.count ? validatePositiveInteger(options.count, 'Count') : 1;

    const sheetsService = await getGoogleSheetsService();
    const sheetName = getActiveSheetName(options.name);

    let insertPosition: number;
    let inheritFromBefore: boolean;
    let sourceRowForFormulas: number;

    if (options.below) {
      insertPosition = rowNumber;
      sourceRowForFormulas = rowNumber - 1;
      inheritFromBefore = false;
    } else {
      insertPosition = rowNumber - 1;
      sourceRowForFormulas = rowNumber - 1;
      inheritFromBefore = !!options.formulas;
    }

    const rowWord = count === 1 ? 'row' : 'rows';
    Logger.loading(`Adding ${count} ${rowWord} ${options.below ? 'below' : 'above'} row ${rowNumber}...`);

    await sheetsService.insertRows(
      sheetName,
      {
        startIndex: insertPosition,
        endIndex: insertPosition + count
      },
      inheritFromBefore
    );

    if (options.formulas) {
      Logger.loading('Copying formulas from adjacent row...');
      await sheetsService.copyRowFormulasBulk(sheetName, sourceRowForFormulas, insertPosition, count);
    }

    Logger.success(`${count} ${rowWord} added successfully ${options.below ? 'below' : 'above'} row ${rowNumber}`);
    if (options.formulas) {
      Logger.info(`Formatting, formulas, and dropdowns copied from row ${sourceRowForFormulas + 1}`);
    }
  };

  return createSubCommandFromSchema(
    CommandNames.SHEET,
    SubCommandNames.ROW_ADD,
    rowAddCommand,
    'Failed to add row'
  );
}
