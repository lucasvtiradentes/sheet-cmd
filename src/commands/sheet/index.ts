import { Command } from 'commander';

import { createAddTabCommand } from './tab_operations/add-tab.js';
import { createAppendRowCommand } from './data_operations/append-row.js';
import { createCopyTabCommand } from './tab_operations/copy-tab.js';
import { createExportCommand } from './import_export/export.js';
import { createImportCsvCommand } from './import_export/import-csv.js';
import { createReadSheetCommand } from './read-sheet.js';
import { createRemoveTabCommand } from './tab_operations/remove-tab.js';
import { createRenameTabCommand } from './tab_operations/rename-tab.js';
import { createWriteCellCommand } from './data_operations/write-cell.js';

export function createSheetCommand(): Command {
  const sheet = new Command('sheet');
  sheet.description('Manage and interact with Google Sheets');

  sheet.addCommand(createReadSheetCommand());
  sheet.addCommand(createAddTabCommand());
  sheet.addCommand(createRemoveTabCommand());
  sheet.addCommand(createRenameTabCommand());
  sheet.addCommand(createCopyTabCommand());
  sheet.addCommand(createWriteCellCommand());
  sheet.addCommand(createAppendRowCommand());
  sheet.addCommand(createImportCsvCommand());
  sheet.addCommand(createExportCommand());

  return sheet;
}
