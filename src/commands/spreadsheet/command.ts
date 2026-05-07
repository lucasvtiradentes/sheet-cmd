import { defineCommand } from '../define';
import { activeSpreadsheetCommand } from './local-configs/active';
import { addSpreadsheetCommand } from './local-configs/add';
import { listSpreadsheetsCommand } from './local-configs/list';
import { removeSpreadsheetCommand } from './local-configs/remove';
import { selectSpreadsheetCommand } from './local-configs/select';

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
