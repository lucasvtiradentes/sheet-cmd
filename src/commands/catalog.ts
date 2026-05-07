import { accountCommand } from './account/command';
import { completionCommand } from './completion';
import { sheetCommand } from './sheet/command';
import { spreadsheetCommand } from './spreadsheet/command';
import { updateCommand } from './update';

export const cliCommands = [accountCommand, spreadsheetCommand, sheetCommand, updateCommand] as const;
export const docsCommands = [...cliCommands, completionCommand] as const;
