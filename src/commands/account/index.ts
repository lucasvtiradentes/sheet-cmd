import { Command } from 'commander';
import { createCommandFromSchema } from '../../definitions/command-builder.js';
import { CommandNames } from '../../definitions/types.js';
import { createAddAccountCommand } from './add-account.js';
import { createListAccountsCommand } from './list-accounts.js';
import { createReauthAccountCommand } from './reauth-account.js';
import { createRemoveAccountCommand } from './remove-account.js';
import { createSelectAccountCommand } from './select-account.js';

export function createAccountCommand(): Command {
  const command = createCommandFromSchema(CommandNames.ACCOUNT);

  command.addCommand(createAddAccountCommand());
  command.addCommand(createListAccountsCommand());
  command.addCommand(createSelectAccountCommand());
  command.addCommand(createRemoveAccountCommand());
  command.addCommand(createReauthAccountCommand());

  return command;
}
