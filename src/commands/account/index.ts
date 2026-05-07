import { Command } from 'commander';
import { createCommandFromSchema } from '../../definitions/command-builder';
import { CommandNames } from '../../definitions/types';
import { createAddAccountCommand } from './add-account';
import { createListAccountsCommand } from './list-accounts';
import { createReauthAccountCommand } from './reauth-account';
import { createRemoveAccountCommand } from './remove-account';
import { createSelectAccountCommand } from './select-account';

export function createAccountCommand(): Command {
  const command = createCommandFromSchema(CommandNames.ACCOUNT);

  command.addCommand(createAddAccountCommand());
  command.addCommand(createListAccountsCommand());
  command.addCommand(createSelectAccountCommand());
  command.addCommand(createRemoveAccountCommand());
  command.addCommand(createReauthAccountCommand());

  return command;
}
