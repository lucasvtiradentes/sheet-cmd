import { Command } from 'commander';

import { createAddTabCommand } from './add-tab.js';
import { createAppendRowCommand } from './append-row.js';
import { createCopyTabCommand } from './copy-tab.js';
import { createListTabsCommand } from './list-tabs.js';
import { createReadSheetCommand } from './read-sheet.js';
import { createRemoveTabCommand } from './remove-tab.js';
import { createRenameTabCommand } from './rename-tab.js';
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

  return sheet;
}
