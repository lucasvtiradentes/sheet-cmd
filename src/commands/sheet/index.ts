import { Command } from 'commander';

import { createAddTabCommand } from './add-tab.js';
import { createAppendRowCommand } from './append-row.js';
import { createBackupCommand } from './backup.js';
import { createCopyTabCommand } from './copy-tab.js';
import { createExportCommand } from './export.js';
import { createImportCsvCommand } from './import-csv.js';
import { createListTabsCommand } from './list-tabs.js';
import { createReadSheetCommand } from './read-sheet.js';
import { createRemoveTabCommand } from './remove-tab.js';
import { createRenameTabCommand } from './rename-tab.js';
import { createRestoreCommand } from './restore.js';
import { createWriteCellCommand } from './write-cell.js';

export function createSheetCommand(): Command {
  const sheet = new Command('sheet');
  sheet.description('Manage and interact with Google Sheets');

  sheet.addCommand(createListTabsCommand());
  sheet.addCommand(createReadSheetCommand());
  sheet.addCommand(createAddTabCommand());
  sheet.addCommand(createRemoveTabCommand());
  sheet.addCommand(createRenameTabCommand());
  sheet.addCommand(createCopyTabCommand());
  sheet.addCommand(createWriteCellCommand());
  sheet.addCommand(createAppendRowCommand());
  sheet.addCommand(createImportCsvCommand());
  sheet.addCommand(createExportCommand());
  sheet.addCommand(createBackupCommand());
  sheet.addCommand(createRestoreCommand());

  return sheet;
}
