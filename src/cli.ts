#!/usr/bin/env node

import { Command } from 'commander';

import { createAccountCommand } from './commands/account/index.js';
import { createCompletionCommand } from './commands/completion.js';
import { displayHelpText } from './commands/help-text.js';
import { createSheetCommand } from './commands/sheet/index.js';
import { createSpreadsheetCommand } from './commands/spreadsheet/index.js';
import { createUpdateCommand } from './commands/update.js';
import { APP_INFO } from './config/constants.js';

const program = new Command();

program
  .name('sheet-cmd')
  .description('Google Sheets CLI - A tool to interact with Google Sheets')
  .version(APP_INFO.version);

program.addCommand(createAccountCommand());
program.addCommand(createSpreadsheetCommand());
program.addCommand(createSheetCommand());
program.addCommand(createUpdateCommand());
program.addCommand(createCompletionCommand());

program.configureHelp({
  sortSubcommands: true,
  subcommandTerm: (cmd) => cmd.name()
});

program.on('--help', () => {
  displayHelpText();
});

program.parse();

if (!process.argv.slice(2).length) {
  program.outputHelp();
}
