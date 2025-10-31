import { Command } from 'commander';
import { getActiveSheetName, getGoogleSheetsService } from '../../../core/command-helpers.js';
import { createSubCommandFromSchema } from '../../../definitions/command-builder.js';
import type { RowAddOptions } from '../../../definitions/command-types.js';
import { CommandNames, SubCommandNames } from '../../../definitions/types.js';
import { Logger } from '../../../utils/logger.js';

export function createRowAddCommand(): Command {
  const rowAddCommand = async (options: RowAddOptions) => {
    if (!options.row) {
      Logger.error('Row number is required. Use --row <number>');
      process.exit(1);
    }

    const rowNumber = parseInt(options.row, 10);
    if (Number.isNaN(rowNumber) || rowNumber < 1) {
      Logger.error('Row number must be a positive integer');
      process.exit(1);
    }

    if (options.above && options.below) {
      Logger.error('Cannot use both --above and --below. Choose one.');
      process.exit(1);
    }

    const count = options.count ? parseInt(options.count, 10) : 1;
    if (Number.isNaN(count) || count < 1) {
      Logger.error('Count must be a positive integer');
      process.exit(1);
    }

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
