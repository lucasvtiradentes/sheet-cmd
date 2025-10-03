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
  Logger.bold('SPREADSHEET MANAGEMENT COMMANDS:');
  Logger.plain('  $ sheet-cmd spreadsheet add              # Add a new spreadsheet (interactive)');
  Logger.plain('  $ sheet-cmd spreadsheet list             # List all spreadsheets (* = active)');
  Logger.plain('  $ sheet-cmd spreadsheet switch <name>    # Set active spreadsheet');
  Logger.plain('  $ sheet-cmd spreadsheet active           # Show currently active spreadsheet');
  Logger.plain('  $ sheet-cmd spreadsheet remove [name]    # Remove a spreadsheet');
  Logger.plain('');
  Logger.bold('SHEET OPERATIONS:');
  Logger.plain('  $ sheet-cmd sheet list-tabs              # List all tabs (uses active spreadsheet)');
  Logger.plain('  $ sheet-cmd sheet list-tabs -s <name>    # List tabs from specific spreadsheet');
  Logger.plain('');
  Logger.bold('UTILITY COMMANDS:');
  Logger.plain('  $ sheet-cmd update                       # Update to latest version');
  Logger.plain('  $ sheet-cmd completion install           # Install shell completion (zsh/bash)');
  Logger.plain('');
  Logger.bold('GETTING STARTED:');
  Logger.plain('  1. Get your service account credentials from Google Cloud Console');
  Logger.plain('     → Go to: https://console.cloud.google.com/');
  Logger.plain('     → Create a service account and download JSON credentials');
  Logger.plain('     → Share your Google Sheet with the service account email');
  Logger.plain('');
  Logger.plain('  2. Add your first spreadsheet:');
  Logger.plain('     → sheet-cmd spreadsheet add');
  Logger.plain('');
  Logger.plain('  3. Set it as active (so you don\'t need -s flag):');
  Logger.plain('     → sheet-cmd spreadsheet switch <name>');
  Logger.plain('');
  Logger.plain('  4. Start using sheet operations:');
  Logger.plain('     → sheet-cmd sheet list-tabs');
  Logger.plain('');
  Logger.dim('TIP: Use tab completion for easier navigation (sheet-cmd completion install)');
  Logger.plain('');
});

// Parse arguments
program.parse();

// If no command provided, show help
if (!process.argv.slice(2).length) {
  program.outputHelp();
}
