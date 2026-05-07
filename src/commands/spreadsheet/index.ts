import type { Program as CaporalProgram } from '@caporal/core';

import { createCommandFromSchema } from '../../definitions/command-builder';
import { CommandNames } from '../../definitions/types';
import { createActiveSpreadsheetCommand } from './local-configs/active-spreadsheet';
import { createAddSpreadsheetCommand } from './local-configs/add-spreadsheet';
import { createListSpreadsheetsCommand } from './local-configs/list-spreadsheets';
import { createRemoveSpreadsheetCommand } from './local-configs/remove-spreadsheet';
import { createSelectSpreadsheetCommand } from './local-configs/select-spreadsheet';

export function createSpreadsheetCommand(program: CaporalProgram): void {
  createCommandFromSchema(program, CommandNames.SPREADSHEET);
  createAddSpreadsheetCommand(program);
  createListSpreadsheetsCommand(program);
  createRemoveSpreadsheetCommand(program);
  createSelectSpreadsheetCommand(program);
  createActiveSpreadsheetCommand(program);
}
