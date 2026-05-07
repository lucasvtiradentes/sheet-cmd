import type { Program as CaporalProgram } from '@caporal/core';
import { getGoogleSheetsService } from '../../../core/command-helpers';
import { createSubCommandFromSchema } from '../../../definitions/command-builder';
import type { SheetAddOptions } from '../../../definitions/command-types';
import { CommandNames, SubCommandNames } from '../../../definitions/types';
import { Logger } from '../../../utils/logger';

export function createAddCommand(program: CaporalProgram): void {
  const sheetAddCommand = async (options: SheetAddOptions) => {
    const sheetsService = await getGoogleSheetsService();

    Logger.loading(`Creating sheet '${options.name}'...`);
    await sheetsService.addSheet(options.name);

    Logger.success(`Sheet '${options.name}' created successfully`);
  };

  createSubCommandFromSchema(
    program,
    CommandNames.SHEET,
    SubCommandNames.SHEET_ADD,
    sheetAddCommand,
    'Failed to add sheet'
  );
}
