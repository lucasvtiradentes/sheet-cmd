import type { Program as CaporalProgram } from '@caporal/core';
import { createCommandFromSchema } from '../../definitions/command-builder';
import { CommandNames } from '../../definitions/types';
import { createAddAccountCommand } from './add-account';
import { createListAccountsCommand } from './list-accounts';
import { createReauthAccountCommand } from './reauth-account';
import { createRemoveAccountCommand } from './remove-account';
import { createSelectAccountCommand } from './select-account';

export function createAccountCommand(program: CaporalProgram): void {
  createCommandFromSchema(program, CommandNames.ACCOUNT);
  createAddAccountCommand(program);
  createListAccountsCommand(program);
  createSelectAccountCommand(program);
  createRemoveAccountCommand(program);
  createReauthAccountCommand(program);
}
