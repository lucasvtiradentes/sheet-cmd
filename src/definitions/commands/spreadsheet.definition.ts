import { APP_INFO } from '../../config/constants.js';
import { type Command, CommandNames, SubCommandNames } from '../types.js';

export const spreadsheetCommandDefinition: Command = {
  name: CommandNames.SPREADSHEET,
  description: 'Manage spreadsheet configurations',
  subcommands: [
    {
      name: SubCommandNames.SPREADSHEET_ADD,
      description: 'Add a new spreadsheet (interactive by default, use --id for manual)',
      flags: [
        {
          name: '--id',
          description: 'Spreadsheet ID (skips interactive selection)',
          type: 'string'
        }
      ],
      examples: [`${APP_INFO.name} spreadsheet add`]
    },
    {
      name: SubCommandNames.SPREADSHEET_LIST,
      description: 'List all configured spreadsheets',
      examples: [`${APP_INFO.name} spreadsheet list`]
    },
    {
      name: SubCommandNames.SPREADSHEET_SELECT,
      description: 'Select a different spreadsheet (sets as active)',
      flags: [
        {
          name: '--id',
          description: 'Spreadsheet ID (skips interactive selection)',
          type: 'string'
        }
      ],
      examples: [`${APP_INFO.name} spreadsheet select`]
    },
    {
      name: SubCommandNames.SPREADSHEET_ACTIVE,
      description: 'Show the currently active spreadsheet',
      examples: [`${APP_INFO.name} spreadsheet active`]
    },
    {
      name: SubCommandNames.SPREADSHEET_REMOVE,
      description: 'Remove a spreadsheet configuration',
      flags: [
        {
          name: '--id',
          description: 'Spreadsheet ID (skips interactive selection)',
          type: 'string'
        }
      ],
      examples: [`${APP_INFO.name} spreadsheet remove`]
    }
  ]
};
