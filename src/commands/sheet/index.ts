import { Command } from 'commander';

import { createListTabsCommand } from './list-tabs.js';

export function createSheetCommand(): Command {
  const sheet = new Command('sheet');
  sheet.description('Manage and interact with Google Sheets');

  sheet.addCommand(createListTabsCommand());

  return sheet;
}
