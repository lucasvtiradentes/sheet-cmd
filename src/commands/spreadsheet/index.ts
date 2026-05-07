import { Command } from 'commander';

import { createCommandFromSchema } from '../../definitions/command-builder';
import { CommandNames } from '../../definitions/types';
import { createActiveSpreadsheetCommand } from './local-configs/active-spreadsheet';
import { createAddSpreadsheetCommand } from './local-configs/add-spreadsheet';
import { createListSpreadsheetsCommand } from './local-configs/list-spreadsheets';
import { createRemoveSpreadsheetCommand } from './local-configs/remove-spreadsheet';
import { createSelectSpreadsheetCommand } from './local-configs/select-spreadsheet';

export function createSpreadsheetCommand(): Command {
  const spreadsheet = createCommandFromSchema(CommandNames.SPREADSHEET);

  spreadsheet.addCommand(createAddSpreadsheetCommand());
  spreadsheet.addCommand(createListSpreadsheetsCommand());
  spreadsheet.addCommand(createRemoveSpreadsheetCommand());
  spreadsheet.addCommand(createSelectSpreadsheetCommand());
  spreadsheet.addCommand(createActiveSpreadsheetCommand());

  return spreadsheet;
}
