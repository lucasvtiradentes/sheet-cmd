import type { Program as CaporalProgram } from '@caporal/core';
import inquirer from 'inquirer';
import { ConfigManager } from '../../../config/config-manager';
import { getGoogleSheetsService } from '../../../core/command-helpers';
import { createSubCommandFromSchema } from '../../../definitions/command-builder';
import type { SheetSelectOptions } from '../../../definitions/command-types';
import { CommandNames, SubCommandNames } from '../../../definitions/types';
import { Logger } from '../../../utils/logger';

export function createSelectCommand(program: CaporalProgram): void {
  const sheetSelectCommand = async (options: SheetSelectOptions) => {
    const configManager = new ConfigManager();
    const activeAccount = configManager.getActiveAccount();

    if (!activeAccount) {
      Logger.error('No active account set.');
      Logger.info('Use: sheet-cmd account add');
      process.exit(1);
    }

    const activeSpreadsheetName = configManager.getActiveSpreadsheetName(activeAccount.email);
    if (!activeSpreadsheetName) {
      Logger.error('No active spreadsheet set.');
      Logger.info('Use: sheet-cmd spreadsheet select <name>');
      process.exit(1);
    }

    let sheetName = options.name;

    if (!sheetName) {
      const sheetsService = await getGoogleSheetsService();
      Logger.loading('Fetching sheets...');
      const info = await sheetsService.getSheetInfo();

      if (info.sheets.length === 0) {
        Logger.warning('No sheets found in spreadsheet.');
        return;
      }

      const activeSheet = configManager.getActiveSheetName(activeAccount.email, activeSpreadsheetName);

      const answer = await inquirer.prompt([
        {
          type: 'list',
          name: 'sheet',
          message: 'Select sheet:',
          choices: info.sheets.map((s) => ({
            name: s.title === activeSheet ? `${s.title} (current)` : s.title,
            value: s.title
          }))
        }
      ]);

      sheetName = answer.sheet;
    }

    if (!sheetName) {
      Logger.error('No sheet name provided');
      return;
    }

    configManager.setActiveSheet(activeAccount.email, activeSpreadsheetName, sheetName);
    Logger.success(`Selected sheet: ${sheetName}`);
  };

  createSubCommandFromSchema(
    program,
    CommandNames.SHEET,
    SubCommandNames.SHEET_SELECT,
    sheetSelectCommand,
    'Failed to select sheet'
  );
}
