import { Command } from 'commander';

import { createActiveSpreadsheetCommand } from './active-spreadsheet.js';
import { createAddSpreadsheetCommand } from './add-spreadsheet.js';
import { createListSpreadsheetsCommand } from './list-spreadsheets.js';
import { createRemoveSpreadsheetCommand } from './remove-spreadsheet.js';
import { createSwitchSpreadsheetCommand } from './switch-spreadsheet.js';

export function createSpreadsheetCommand(): Command {
  const spreadsheet = new Command('spreadsheet');
  spreadsheet.description('Manage spreadsheet configurations');

  spreadsheet.addCommand(createAddSpreadsheetCommand());
  spreadsheet.addCommand(createListSpreadsheetsCommand());
  spreadsheet.addCommand(createRemoveSpreadsheetCommand());
  spreadsheet.addCommand(createSwitchSpreadsheetCommand());
  spreadsheet.addCommand(createActiveSpreadsheetCommand());

  return spreadsheet;
}
