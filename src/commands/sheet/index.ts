import { Command } from 'commander';

import { createAddTabCommand } from './add-tab.js';
import { createListTabsCommand } from './list-tabs.js';
import { createReadSheetCommand } from './read-sheet.js';
import { createRemoveTabCommand } from './remove-tab.js';

export function createSheetCommand(): Command {
  const sheet = new Command('sheet');
  sheet.description('Manage and interact with Google Sheets');

  sheet.addCommand(createListTabsCommand());
  sheet.addCommand(createReadSheetCommand());
  sheet.addCommand(createAddTabCommand());
  sheet.addCommand(createRemoveTabCommand());

  return sheet;
}
