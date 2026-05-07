import { APP_INFO } from '../../config/constants';
import { type Command, CommandNames, SubCommandNames } from '../types';

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
          description: 'Spreadsheet ID or URL (skips interactive selection)',
          type: 'string'
        },
        {
          name: '--name',
          description: 'Local name for the spreadsheet',
          type: 'string'
        }
      ],
      examples: [
        `${APP_INFO.name} spreadsheet add`,
        `${APP_INFO.name} spreadsheet add --id "https://docs.google.com/spreadsheets/d/abc123" --name "Budget"`
      ]
    },
    {
      name: SubCommandNames.SPREADSHEET_LIST,
      description: 'List all configured spreadsheets',
      flags: [
        {
          name: '--output',
          alias: '-o',
          description: 'Output format',
          type: 'string',
          choices: ['text', 'json']
        }
      ],
      examples: [`${APP_INFO.name} spreadsheet list`]
    },
    {
      name: SubCommandNames.SPREADSHEET_SELECT,
      description: 'Select a different spreadsheet (sets as active)',
      flags: [
        {
          name: '--id',
          description: 'Spreadsheet ID or URL (skips interactive selection)',
          type: 'string'
        },
        {
          name: '--add',
          description: 'Add the spreadsheet if it is not configured',
          type: 'boolean'
        },
        {
          name: '--name',
          description: 'Local name to use with --add',
          type: 'string'
        }
      ],
      examples: [
        `${APP_INFO.name} spreadsheet select`,
        `${APP_INFO.name} spreadsheet select --id "https://docs.google.com/spreadsheets/d/abc123" --add --name "Budget"`
      ]
    },
    {
      name: SubCommandNames.SPREADSHEET_ACTIVE,
      description: 'Show the currently active spreadsheet',
      flags: [
        {
          name: '--output',
          alias: '-o',
          description: 'Output format',
          type: 'string',
          choices: ['text', 'json']
        }
      ],
      examples: [`${APP_INFO.name} spreadsheet active`]
    },
    {
      name: SubCommandNames.SPREADSHEET_REMOVE,
      description: 'Remove a spreadsheet configuration',
      flags: [
        {
          name: '--id',
          description: 'Spreadsheet ID or URL (skips interactive selection)',
          type: 'string'
        }
      ],
      examples: [`${APP_INFO.name} spreadsheet remove`]
    }
  ]
};
