import { Command } from 'commander';

import { createActiveSpreadsheetCommand } from './local-configs/active-spreadsheet.js';
import { createAddSpreadsheetCommand } from './local-configs/add-spreadsheet.js';
import { createListSpreadsheetsCommand } from './local-configs/list-spreadsheets.js';
import { createRemoveSpreadsheetCommand } from './local-configs/remove-spreadsheet.js';
import { createSwitchSpreadsheetCommand } from './local-configs/switch-spreadsheet.js';
import { createListTabsCommand } from '../spreadsheet/list-tabs.js';

export function createSpreadsheetCommand(): Command {
  const spreadsheet = new Command('spreadsheet');
  spreadsheet.description('Manage spreadsheet configurations');

  spreadsheet.addCommand(createListTabsCommand());
  spreadsheet.addCommand(createAddSpreadsheetCommand());
  spreadsheet.addCommand(createListSpreadsheetsCommand());
  spreadsheet.addCommand(createRemoveSpreadsheetCommand());
  spreadsheet.addCommand(createSwitchSpreadsheetCommand());
  spreadsheet.addCommand(createActiveSpreadsheetCommand());

  return spreadsheet;
}
