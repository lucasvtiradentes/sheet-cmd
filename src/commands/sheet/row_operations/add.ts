import { defineSubCommand, flag } from '../../../cli/define';
import { getActiveSheetName, getGoogleSheetsService } from '../../../core/command-helpers';
import { Logger } from '../../../utils/logger';
import { validatePositiveInteger, validateRequired } from '../../../utils/validators';

export const rowAddCommand = defineSubCommand({
  name: 'row-add',
  description: 'Add a row to the sheet',
  flags: [
    flag.string('--row', 'Row number (1-indexed)', { alias: '-r', required: true }),
    flag.string('--name', 'Tab name (uses active if not provided)', { alias: '-n' }),
    flag.boolean('--above', 'Insert row above the specified row'),
    flag.boolean('--below', 'Insert row below the specified row'),
    flag.boolean('--formulas', 'Copy formatting, formulas, and data validation from adjacent row', { alias: '-f' }),
    flag.string('--count', 'Number of rows to add (default: 1)', { alias: '-c' })
  ],
  errorMessage: 'Failed to add row',
  action: async ({ options }) => {
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
  }
});
