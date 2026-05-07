import { accountCommand } from './account';
import { completionCommand } from './completion';
import { sheetCommand } from './sheet';
import { spreadsheetCommand } from './spreadsheet';
import { updateCommand } from './update';

export const cliCommands = [accountCommand, spreadsheetCommand, sheetCommand, updateCommand] as const;
export const docsCommands = [...cliCommands, completionCommand] as const;
