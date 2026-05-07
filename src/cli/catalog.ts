import { addAccountCommand } from '../commands/account/add';
import { listAccountsCommand } from '../commands/account/list';
import { reauthAccountCommand } from '../commands/account/reauth';
import { removeAccountCommand } from '../commands/account/remove';
import { selectAccountCommand } from '../commands/account/select';
import { completionCommand } from '../commands/completion';
import { appendCommand } from '../commands/sheet/data_operations/append';
import { writeCommand } from '../commands/sheet/data_operations/write';
import { exportCommand } from '../commands/sheet/import_export/export';
import { importCommand } from '../commands/sheet/import_export/import';
import { listCommand } from '../commands/sheet/list';
import { readCommand } from '../commands/sheet/read';
import { rowAddCommand } from '../commands/sheet/row_operations/add';
import { rowRemoveCommand } from '../commands/sheet/row_operations/remove';
import { activeCommand } from '../commands/sheet/sheet_operations/active';
import { addCommand } from '../commands/sheet/sheet_operations/add';
import { copyCommand } from '../commands/sheet/sheet_operations/copy';
import { removeCommand } from '../commands/sheet/sheet_operations/remove';
import { renameCommand } from '../commands/sheet/sheet_operations/rename';
import { selectCommand } from '../commands/sheet/sheet_operations/select';
import { activeSpreadsheetCommand } from '../commands/spreadsheet/active';
import { addSpreadsheetCommand } from '../commands/spreadsheet/add';
import { createSpreadsheetCommand } from '../commands/spreadsheet/create';
import { listSpreadsheetsCommand } from '../commands/spreadsheet/list';
import { removeSpreadsheetCommand } from '../commands/spreadsheet/remove';
import { selectSpreadsheetCommand } from '../commands/spreadsheet/select';
import { updateCommand } from '../commands/update';
import { defineCommand } from './define';

const accountCommand = defineCommand({
  name: 'account',
  description: 'Manage Google accounts',
  subcommands: [
    addAccountCommand,
    listAccountsCommand,
    selectAccountCommand,
    removeAccountCommand,
    reauthAccountCommand
  ]
});

const spreadsheetCommand = defineCommand({
  name: 'spreadsheet',
  description: 'Manage spreadsheet configurations',
  subcommands: [
    addSpreadsheetCommand,
    createSpreadsheetCommand,
    listSpreadsheetsCommand,
    removeSpreadsheetCommand,
    selectSpreadsheetCommand,
    activeSpreadsheetCommand
  ]
});

const sheetCommand = defineCommand({
  name: 'sheet',
  description: 'Manage and interact with spreadsheet sheets',
  subcommands: [
    listCommand,
    activeCommand,
    selectCommand,
    readCommand,
    addCommand,
    removeCommand,
    renameCommand,
    copyCommand,
    writeCommand,
    appendCommand,
    importCommand,
    exportCommand,
    rowAddCommand,
    rowRemoveCommand
  ]
});

export const cliCommands = [accountCommand, spreadsheetCommand, sheetCommand, updateCommand] as const;
export const docsCommands = [...cliCommands, completionCommand] as const;
