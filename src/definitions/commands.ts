import { accountCommandDefinition } from './commands/account.definition.js';
import { completionCommandDefinition } from './commands/completion.definition.js';
import { sheetCommandDefinition } from './commands/sheet.definition.js';
import { spreadsheetCommandDefinition } from './commands/spreadsheet.definition.js';
import { updateCommandDefinition } from './commands/update.definition.js';
import type { Command, SubCommand } from './types.js';

export const COMMANDS_SCHEMA: Command[] = [
  accountCommandDefinition,
  spreadsheetCommandDefinition,
  sheetCommandDefinition,
  updateCommandDefinition,
  completionCommandDefinition
];

export function getAllCommands(): Command[] {
  return COMMANDS_SCHEMA;
}

export function getCommand(name: string): Command | undefined {
  return COMMANDS_SCHEMA.find((cmd) => cmd.name === name || cmd.aliases?.includes(name));
}

export function getSubCommand(commandName: string, subCommandName: string): SubCommand | undefined {
  const command = getCommand(commandName);
  return command?.subcommands?.find((sub) => sub.name === subCommandName || sub.aliases?.includes(subCommandName));
}
