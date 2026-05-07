#!/usr/bin/env node

import { Command } from 'commander';

import { createAccountCommand } from './commands/account/index';
import { createCompletionCommand } from './commands/completion';
import { displayHelpText } from './commands/help-text';
import { createSheetCommand } from './commands/sheet/index';
import { createSpreadsheetCommand } from './commands/spreadsheet/index';
import { createUpdateCommand } from './commands/update';
import { APP_INFO } from './config/constants';

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
