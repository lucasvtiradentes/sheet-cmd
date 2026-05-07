import { accountCommandDefinition } from './commands/account.definition';
import { completionCommandDefinition } from './commands/completion.definition';
import { sheetCommandDefinition } from './commands/sheet.definition';
import { spreadsheetCommandDefinition } from './commands/spreadsheet.definition';
import { updateCommandDefinition } from './commands/update.definition';
import type { Command, SubCommand } from './types';

export const COMMANDS_SCHEMA: Command[] = [
  accountCommandDefinition,
  spreadsheetCommandDefinition,
  sheetCommandDefinition,
  updateCommandDefinition,
  completionCommandDefinition
];

export function getCommand(name: string): Command | undefined {
  return COMMANDS_SCHEMA.find((cmd) => cmd.name === name || cmd.aliases?.includes(name));
}

export function getSubCommand(commandName: string, subCommandName: string): SubCommand | undefined {
  const command = getCommand(commandName);
  return command?.subcommands?.find((sub) => sub.name === subCommandName || sub.aliases?.includes(subCommandName));
}
