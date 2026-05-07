import { defineCommand } from '../define';
import { addAccountCommand } from './add';
import { listAccountsCommand } from './list';
import { reauthAccountCommand } from './reauth';
import { removeAccountCommand } from './remove';
import { selectAccountCommand } from './select';

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
