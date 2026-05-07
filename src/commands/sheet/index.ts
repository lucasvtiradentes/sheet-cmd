import { defineCommand } from '../define';
import { appendCommand } from './data_operations/append';
import { writeCommand } from './data_operations/write';
import { exportCommand } from './import_export/export';
import { importCommand } from './import_export/import';
import { listCommand } from './list';
import { readCommand } from './read';
import { rowAddCommand } from './row_operations/add-row';
import { rowRemoveCommand } from './row_operations/remove-row';
import { activeCommand } from './sheet_operations/active';
import { addCommand } from './sheet_operations/add';
import { copyCommand } from './sheet_operations/copy';
import { removeCommand } from './sheet_operations/remove';
import { renameCommand } from './sheet_operations/rename';
import { selectCommand } from './sheet_operations/select';

export const sheetCommand = defineCommand({
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
