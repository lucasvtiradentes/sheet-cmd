#!/usr/bin/env node

import { Command } from 'commander';

import { createCompletionCommand } from './commands/completion.js';
import { createSheetCommand } from './commands/sheet/index.js';
import { createSpreadsheetCommand } from './commands/spreadsheet/index.js';
import { createUpdateCommand } from './commands/update.js';
import { APP_INFO } from './constants.js';
import { Logger } from './lib/logger.js';

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
  Logger.plain('');
  Logger.bold('Examples:');
  Logger.plain('  $ sheet-cmd spreadsheet add              # Add a new spreadsheet');
  Logger.plain('  $ sheet-cmd spreadsheet list             # List all spreadsheets');
  Logger.plain('  $ sheet-cmd sheet list-tabs -s mysheet   # List all tabs in spreadsheet');
  Logger.plain('  $ sheet-cmd update                       # Update to latest version');
  Logger.plain('  $ sheet-cmd completion install           # Install shell completion');
  Logger.plain('');
  Logger.bold('Getting Started:');
  Logger.plain('  1. Get your service account credentials from Google Cloud Console');
  Logger.plain('  2. Run: sheet-cmd spreadsheet add');
  Logger.plain('  3. List tabs: sheet-cmd sheet list-tabs -s <name>');
  Logger.plain('');
});

// Parse arguments
program.parse();

// If no command provided, show help
if (!process.argv.slice(2).length) {
  program.outputHelp();
}
