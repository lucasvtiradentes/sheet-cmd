import { Command } from 'commander';
import inquirer from 'inquirer';
import { ConfigManager } from '../../../config/config-manager.js';
import { getGoogleSheetsService } from '../../../core/command-helpers.js';
import { createSubCommandFromSchema } from '../../../definitions/command-builder.js';
import type { SheetSelectOptions } from '../../../definitions/command-types.js';
import { CommandNames, SubCommandNames } from '../../../definitions/types.js';
import { Logger } from '../../../utils/logger.js';

export function createSelectCommand(): Command {
  return createSubCommandFromSchema(
    CommandNames.SHEET,
    SubCommandNames.SHEET_SELECT,
    async (options: SheetSelectOptions) => {
      try {
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
      } catch (error) {
        Logger.error('Failed to select sheet', error);
        process.exit(1);
      }
    }
  );
}
