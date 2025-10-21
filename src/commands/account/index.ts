import { Command } from 'commander';
import { createAddAccountCommand } from './add-account.js';
import { createListAccountsCommand } from './list-accounts.js';
import { createRemoveAccountCommand } from './remove-account.js';
import { createReauthAccountCommand } from './reauth-account.js';
import { createSwitchAccountCommand } from './switch-account.js';

export function createAccountCommand(): Command {
  const command = new Command('account');

  command.description('Manage Google accounts');

  command.addCommand(createAddAccountCommand());
  command.addCommand(createListAccountsCommand());
  command.addCommand(createSwitchAccountCommand());
  command.addCommand(createRemoveAccountCommand());
  command.addCommand(createReauthAccountCommand());

  return command;
}
