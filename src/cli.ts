#!/usr/bin/env node

import { Command } from 'commander';

import { createCompletionCommand } from './commands/completion.js';
import { displayHelpText } from './commands/help-text.js';
import { createSheetCommand } from './commands/sheet/index.js';
import { createSpreadsheetCommand } from './commands/spreadsheet/index.js';
import { createUpdateCommand } from './commands/update.js';
import { APP_INFO } from './constants.js';

const program = new Command();

program
  .name('sheet-cmd')
  .description('Google Sheets CLI - A tool to interact with Google Sheets')
  .version(APP_INFO.version);

// Add commands
program.addCommand(createSpreadsheetCommand());
program.addCommand(createSheetCommand());
program.addCommand(createUpdateCommand());
program.addCommand(createCompletionCommand());

// Global help improvements
program.configureHelp({
  sortSubcommands: true,
  subcommandTerm: (cmd) => cmd.name()
});

program.on('--help', () => {
  displayHelpText();
});

// Parse arguments
program.parse();

// If no command provided, show help
if (!process.argv.slice(2).length) {
  program.outputHelp();
}
