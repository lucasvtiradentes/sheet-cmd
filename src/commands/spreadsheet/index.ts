import { defineCommand } from '../define';
import { activeSpreadsheetCommand } from './local-configs/active-spreadsheet';
import { addSpreadsheetCommand } from './local-configs/add-spreadsheet';
import { listSpreadsheetsCommand } from './local-configs/list-spreadsheets';
import { removeSpreadsheetCommand } from './local-configs/remove-spreadsheet';
import { selectSpreadsheetCommand } from './local-configs/select-spreadsheet';

export const spreadsheetCommand = defineCommand({
  name: 'spreadsheet',
  description: 'Manage spreadsheet configurations',
  subcommands: [
    addSpreadsheetCommand,
    listSpreadsheetsCommand,
    removeSpreadsheetCommand,
    selectSpreadsheetCommand,
    activeSpreadsheetCommand
  ]
});
