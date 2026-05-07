import type { Program as CaporalProgram } from '@caporal/core';
import inquirer from 'inquirer';
import { ConfigManager } from '../../../config/config-manager';
import { GoogleSheetsService } from '../../../core/google-sheets.service';
import { createSubCommandFromSchema } from '../../../definitions/command-builder';
import type { SpreadsheetSelectOptions } from '../../../definitions/command-types';
import { CommandNames, SubCommandNames } from '../../../definitions/types';
import { Logger } from '../../../utils/logger';
import { parseSpreadsheetId } from '../../../utils/spreadsheet';

export function createSelectSpreadsheetCommand(program: CaporalProgram): void {
  const spreadsheetSelectCommand = async (options: SpreadsheetSelectOptions) => {
    const configManager = new ConfigManager();
    const activeAccount = configManager.getActiveAccount();

    if (!activeAccount) {
      Logger.error('No active account set.');
      Logger.info('Use: sheet-cmd account add');
      process.exit(1);
    }

    let spreadsheetId = options.id ? parseSpreadsheetId(options.id) : undefined;

    if (!spreadsheetId) {
      const spreadsheets = configManager.listSpreadsheets(activeAccount.email);

      if (spreadsheets.length === 0) {
        Logger.warning('No spreadsheets configured. Use "sheet-cmd spreadsheet add" to add one.');
        return;
      }

      const activeSpreadsheet = configManager.getActiveSpreadsheetName(activeAccount.email);

      const answer = await inquirer.prompt([
        {
          type: 'list',
          name: 'spreadsheet',
          message: 'Select spreadsheet:',
          choices: spreadsheets.map((s) => ({
            name: s.name === activeSpreadsheet ? `${s.name} (current)` : s.name,
            value: s.spreadsheetId
          }))
        }
      ]);

      spreadsheetId = answer.spreadsheet;
    }

    if (!spreadsheetId) {
      Logger.error('No spreadsheet ID provided');
      return;
    }

    let spreadsheet = configManager.getSpreadsheetById(activeAccount.email, spreadsheetId);
    if (!spreadsheet) {
      if (!options.add) {
        Logger.error(`Spreadsheet with ID '${spreadsheetId}' not found`);
        Logger.info('Use --add to add and select this spreadsheet.');
        process.exit(1);
      }

      const name =
        options.name?.trim() || (await getSpreadsheetTitle(configManager, activeAccount.email, spreadsheetId));
      await configManager.addSpreadsheet(activeAccount.email, name, spreadsheetId);
      spreadsheet = configManager.getSpreadsheetById(activeAccount.email, spreadsheetId);
      Logger.success(`Added spreadsheet: ${name}`);
    }

    const spreadsheetName = Object.entries(configManager.listSpreadsheets(activeAccount.email)).find(
      ([_, s]) => s.spreadsheetId === spreadsheetId
    )?.[1]?.name;

    if (!spreadsheetName) {
      Logger.error(`Spreadsheet with ID '${spreadsheetId}' not found`);
      process.exit(1);
    }

    configManager.setActiveSpreadsheet(activeAccount.email, spreadsheetName);
    Logger.success(`Selected spreadsheet: ${spreadsheetName}`);
  };

  createSubCommandFromSchema(
    program,
    CommandNames.SPREADSHEET,
    SubCommandNames.SPREADSHEET_SELECT,
    spreadsheetSelectCommand,
    'Failed to select spreadsheet'
  );
}

async function getSpreadsheetTitle(
  configManager: ConfigManager,
  email: string,
  spreadsheetId: string
): Promise<string> {
  const credentials = await configManager.getRefreshedCredentials(email);
  const sheetsService = new GoogleSheetsService({
    spreadsheetId,
    oauthCredentials: credentials
  });
  const info = await sheetsService.getSheetInfo();
  return info.title;
}
