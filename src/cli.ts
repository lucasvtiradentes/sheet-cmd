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
  Logger.plain('  Tab Management:');
  Logger.plain('  $ sheet-cmd sheet list-tabs              # List all tabs');
  Logger.plain('  $ sheet-cmd sheet add-tab -t <name>      # Add a new tab');
  Logger.plain('  $ sheet-cmd sheet remove-tab -t <name>   # Remove a tab');
  Logger.plain('  $ sheet-cmd sheet rename-tab -t <old> -n <new>  # Rename a tab');
  Logger.plain('  $ sheet-cmd sheet copy-tab -t <name> --to <new> # Copy a tab');
  Logger.plain('');
  Logger.plain('  Data Operations:');
  Logger.plain('  $ sheet-cmd sheet read-sheet -t <name>   # Read sheet content');
  Logger.plain('  $ sheet-cmd sheet write-cell -t <name> -c A1 -v "value"  # Write to cell');
  Logger.plain('  $ sheet-cmd sheet write-cell -t <name> -r A1:B2 -v "v1,v2;v3,v4"  # Write range');
  Logger.plain('  $ sheet-cmd sheet append-row -t <name> -v "val1,val2,val3"  # Append row');
  Logger.plain('');
  Logger.plain('  Import/Export:');
  Logger.plain('  $ sheet-cmd sheet import-csv -t <name> -f data.csv  # Import CSV');
  Logger.plain('  $ sheet-cmd sheet export -t <name> -f json  # Export to JSON/CSV');
  Logger.plain('  $ sheet-cmd sheet backup -o ./backup/    # Backup with formulas');
  Logger.plain('  $ sheet-cmd sheet restore -i ./backup/dir/  # Restore from backup');
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
