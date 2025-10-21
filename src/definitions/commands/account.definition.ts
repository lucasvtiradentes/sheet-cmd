import { APP_INFO } from '../../config/constants.js';
import { type Command, CommandNames, SubCommandNames } from '../types.js';

export const accountCommandDefinition: Command = {
  name: CommandNames.ACCOUNT,
  description: 'Manage Google accounts',
  subcommands: [
    {
      name: SubCommandNames.ACCOUNT_ADD,
      description: 'Add a Google account via OAuth',
      examples: [`${APP_INFO.name} account add`]
    },
    {
      name: SubCommandNames.ACCOUNT_LIST,
      description: 'List all configured Google accounts',
      examples: [`${APP_INFO.name} account list`]
    },
    {
      name: SubCommandNames.ACCOUNT_SELECT,
      description: 'Select active Google account',
      examples: [`${APP_INFO.name} account select`]
    },
    {
      name: SubCommandNames.ACCOUNT_REMOVE,
      description: 'Remove a Google account',
      examples: [`${APP_INFO.name} account remove`]
    },
    {
      name: SubCommandNames.ACCOUNT_REAUTH,
      description: 'Re-authenticate the active account',
      examples: [`${APP_INFO.name} account reauth`]
    }
  ]
};
