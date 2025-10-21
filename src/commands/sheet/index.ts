import { Command } from 'commander';
import { createAppendRowCommand } from './data_operations/append-row.js';
import { createWriteCellCommand } from './data_operations/write-cell.js';
import { createExportCommand } from './import_export/export.js';
import { createImportCsvCommand } from './import_export/import-csv.js';
import { createListSheetsCommand } from './list-sheets.js';
import { createReadSheetCommand } from './read-sheet.js';
import { createAddSheetCommand } from './sheet_operations/add-sheet.js';
import { createCopySheetCommand } from './sheet_operations/copy-sheet.js';
import { createRemoveSheetCommand } from './sheet_operations/remove-sheet.js';
import { createRenameSheetCommand } from './sheet_operations/rename-sheet.js';

export function createSheetCommand(): Command {
  const sheet = new Command('sheet');
  sheet.description('Manage and interact with Google Sheets');

  sheet.addCommand(createListSheetsCommand());
  sheet.addCommand(createReadSheetCommand());
  sheet.addCommand(createAddSheetCommand());
  sheet.addCommand(createRemoveSheetCommand());
  sheet.addCommand(createRenameSheetCommand());
  sheet.addCommand(createCopySheetCommand());
  sheet.addCommand(createWriteCellCommand());
  sheet.addCommand(createAppendRowCommand());
  sheet.addCommand(createImportCsvCommand());
  sheet.addCommand(createExportCommand());

  return sheet;
}
