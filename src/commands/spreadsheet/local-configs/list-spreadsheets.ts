import type { Program as CaporalProgram } from '@caporal/core';
import { ConfigManager } from '../../../config/config-manager';
import { createSubCommandFromSchema } from '../../../definitions/command-builder';
import type { SpreadsheetListOptions } from '../../../definitions/command-types';
import { CommandNames, SubCommandNames } from '../../../definitions/types';
import { Logger } from '../../../utils/logger';
import { getSpreadsheetUrl } from '../../../utils/spreadsheet';

export function createListSpreadsheetsCommand(program: CaporalProgram): void {
  const spreadsheetListCommand = async (options: SpreadsheetListOptions) => {
    const configManager = new ConfigManager();
    const activeAccount = configManager.getActiveAccount();

    if (!activeAccount) {
      Logger.error('No active account set.');
      Logger.info('Use: sheet-cmd account add');
      return;
    }

    const spreadsheets = configManager.listSpreadsheets(activeAccount.email);
    const activeSpreadsheetName = configManager.getActiveSpreadsheetName(activeAccount.email);

    if (options.output === 'json') {
      Logger.json({
        activeAccount: activeAccount.email,
        activeSpreadsheet: activeSpreadsheetName,
        spreadsheets: spreadsheets.map((spreadsheet) => ({
          name: spreadsheet.name,
          spreadsheetId: spreadsheet.spreadsheetId,
          url: getSpreadsheetUrl(spreadsheet.spreadsheetId),
          activeSheet: spreadsheet.activeSheet ?? null,
          active: spreadsheet.name === activeSpreadsheetName
        }))
      });
      return;
    }

    if (spreadsheets.length === 0) {
      Logger.warning('No spreadsheets configured. Use "sheet-cmd spreadsheet add" to add one.');
      return;
    }

    Logger.bold(`\nSpreadsheets for ${activeAccount.email}:`);
    spreadsheets.forEach((spreadsheet) => {
      const isActive = spreadsheet.name === activeSpreadsheetName;
      const marker = isActive ? '* ' : '  ';
      Logger.plain(`${marker}${spreadsheet.name}${isActive ? ' (active)' : ''}`);
      Logger.dim(`    ID: ${spreadsheet.spreadsheetId}`);
      Logger.dim(`    URL: ${getSpreadsheetUrl(spreadsheet.spreadsheetId)}`);
      if (spreadsheet.activeSheet) {
        Logger.dim(`    Active sheet: ${spreadsheet.activeSheet}`);
      }
    });

    if (activeSpreadsheetName) {
      Logger.plain('');
      Logger.dim('* = active spreadsheet');
    }
  };

  createSubCommandFromSchema(
    program,
    CommandNames.SPREADSHEET,
    SubCommandNames.SPREADSHEET_LIST,
    spreadsheetListCommand,
    'Failed to list spreadsheets'
  );
}
