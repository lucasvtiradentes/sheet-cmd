import { Command } from 'commander';

import { createCommandFromSchema } from '../../definitions/command-builder.js';
import { CommandNames } from '../../definitions/types.js';
import { createActiveSpreadsheetCommand } from './local-configs/active-spreadsheet.js';
import { createAddSpreadsheetCommand } from './local-configs/add-spreadsheet.js';
import { createListSpreadsheetsCommand } from './local-configs/list-spreadsheets.js';
import { createRemoveSpreadsheetCommand } from './local-configs/remove-spreadsheet.js';
import { createSelectSpreadsheetCommand } from './local-configs/select-spreadsheet.js';

export function createSpreadsheetCommand(): Command {
  const spreadsheet = createCommandFromSchema(CommandNames.SPREADSHEET);

  spreadsheet.addCommand(createAddSpreadsheetCommand());
  spreadsheet.addCommand(createListSpreadsheetsCommand());
  spreadsheet.addCommand(createRemoveSpreadsheetCommand());
  spreadsheet.addCommand(createSelectSpreadsheetCommand());
  spreadsheet.addCommand(createActiveSpreadsheetCommand());

  return spreadsheet;
}
