import type { Program as CaporalProgram } from '@caporal/core';
import { getGoogleSheetsService } from '../../core/command-helpers';
import { createSubCommandFromSchema } from '../../definitions/command-builder';
import type { SheetListOptions } from '../../definitions/command-types';
import { CommandNames, SubCommandNames } from '../../definitions/types';
import { Logger } from '../../utils/logger';

export function createListCommand(program: CaporalProgram): void {
  const sheetListCommand = async (options: SheetListOptions) => {
    const sheetsService = await getGoogleSheetsService();

    if (options.output !== 'json') {
      Logger.loading('Fetching spreadsheet info...');
    }
    const info = await sheetsService.getSheetInfo();

    if (options.output === 'json') {
      Logger.json(info);
      return;
    }

    Logger.success(`Connected to spreadsheet: ${info.title}`);
    Logger.bold(`\n📋 Sheets (${info.sheets.length}):\n`);

    info.sheets.forEach((sheet) => {
      Logger.plain(`  ${sheet.index + 1}. ${sheet.title}`);
      Logger.dim(`     ID: ${sheet.sheetId}`);
    });
  };

  createSubCommandFromSchema(
    program,
    CommandNames.SHEET,
    SubCommandNames.SHEET_LIST,
    sheetListCommand,
    'Failed to list sheets'
  );
}
