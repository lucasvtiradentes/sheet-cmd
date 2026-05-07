import { defineCommand } from '../define';
import { addAccountCommand } from './add-account';
import { listAccountsCommand } from './list-accounts';
import { reauthAccountCommand } from './reauth-account';
import { removeAccountCommand } from './remove-account';
import { selectAccountCommand } from './select-account';

export const accountCommand = defineCommand({
  name: 'account',
  description: 'Manage Google accounts',
  subcommands: [
    addAccountCommand,
    listAccountsCommand,
    selectAccountCommand,
    removeAccountCommand,
    reauthAccountCommand
  ]
});
