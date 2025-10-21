import { APP_INFO } from '../../config/constants.js';
import { type Command, CommandNames, SubCommandNames } from '../types.js';

export const sheetCommandDefinition: Command = {
  name: CommandNames.SHEET,
  description: 'Manage and interact with spreadsheet sheets',
  subcommands: [
    {
      name: SubCommandNames.SHEET_LIST,
      description: 'List all sheets in a spreadsheet',
      examples: [`${APP_INFO.name} sheet list`]
    },
    {
      name: SubCommandNames.SHEET_SELECT,
      description: 'Select a sheet (sets as active)',
      flags: [
        {
          name: '--name',
          alias: '-n',
          description: 'Tab name (skips interactive selection)',
          type: 'string'
        }
      ],
      examples: [`${APP_INFO.name} sheet select`]
    },
    {
      name: SubCommandNames.SHEET_READ,
      description: 'Read the complete content of a sheet',
      flags: [
        {
          name: '--name',
          alias: '-n',
          description: 'Tab name (uses active if not provided)',
          type: 'string'
        },
        {
          name: '--output',
          alias: '-o',
          description: 'Output format',
          type: 'string',
          choices: ['markdown', 'csv']
        },
        {
          name: '--formulas',
          alias: '-f',
          description: 'Include formulas instead of values',
          type: 'boolean'
        },
        {
          name: '--export',
          alias: '-e',
          description: 'Export to file',
          type: 'string'
        }
      ],
      examples: [
        `${APP_INFO.name} sheet read -n "Sheet1"`,
        `${APP_INFO.name} sheet read -n "Sheet1" -o markdown`,
        `${APP_INFO.name} sheet read -n "Sheet1" -e output.csv`
      ]
    },
    {
      name: SubCommandNames.SHEET_ADD,
      description: 'Add a new sheet to the spreadsheet',
      flags: [
        {
          name: '--name',
          alias: '-n',
          description: 'Tab name',
          type: 'string',
          required: true
        }
      ],
      examples: [`${APP_INFO.name} sheet add -n "NewSheet"`]
    },
    {
      name: SubCommandNames.SHEET_REMOVE,
      description: 'Remove a sheet from the spreadsheet',
      flags: [
        {
          name: '--name',
          alias: '-n',
          description: 'Tab name (uses active if not provided)',
          type: 'string'
        }
      ],
      examples: [`${APP_INFO.name} sheet remove -n "OldSheet"`]
    },
    {
      name: SubCommandNames.SHEET_RENAME,
      description: 'Rename a sheet in the spreadsheet',
      flags: [
        {
          name: '--name',
          alias: '-n',
          description: 'Current tab name (uses active if not provided)',
          type: 'string'
        },
        {
          name: '--new-name',
          description: 'New tab name',
          type: 'string',
          required: true
        }
      ],
      examples: [`${APP_INFO.name} sheet rename -n "OldName" --new-name "NewName"`]
    },
    {
      name: SubCommandNames.SHEET_COPY,
      description: 'Copy a sheet to a new sheet',
      flags: [
        {
          name: '--name',
          alias: '-n',
          description: 'Source tab name (uses active if not provided)',
          type: 'string'
        },
        {
          name: '--to',
          description: 'Destination tab name',
          type: 'string',
          required: true
        }
      ],
      examples: [`${APP_INFO.name} sheet copy -n "Sheet1" --to "Sheet1 Copy"`]
    },
    {
      name: SubCommandNames.SHEET_WRITE,
      description: 'Write to a specific cell or range of cells',
      flags: [
        {
          name: '--name',
          alias: '-n',
          description: 'Tab name (uses active if not provided)',
          type: 'string'
        },
        {
          name: '--cell',
          alias: '-c',
          description: 'Cell address (e.g., A1) - required if --range not provided',
          type: 'string',
          required: true
        },
        {
          name: '--range',
          alias: '-r',
          description: 'Range (e.g., A1:B2) - required if --cell not provided',
          type: 'string',
          required: true
        },
        {
          name: '--value',
          alias: '-v',
          description: 'Value to write (use , for columns, ; for rows)',
          type: 'string',
          required: true
        }
      ],
      examples: [
        `${APP_INFO.name} sheet write -n "Sheet1" -c A1 -v "Hello"`,
        `${APP_INFO.name} sheet write -n "Sheet1" -r A1:B2 -v "v1,v2;v3,v4"`
      ]
    },
    {
      name: SubCommandNames.SHEET_APPEND,
      description: 'Append a new row to the end of the sheet',
      flags: [
        {
          name: '--name',
          alias: '-n',
          description: 'Tab name (uses active if not provided)',
          type: 'string'
        },
        {
          name: '--value',
          alias: '-v',
          description: 'Values to append (comma-separated)',
          type: 'string',
          required: true
        }
      ],
      examples: [`${APP_INFO.name} sheet append -n "Sheet1" -v "val1,val2,val3"`]
    },
    {
      name: SubCommandNames.SHEET_IMPORT,
      description: 'Import CSV file to a sheet',
      flags: [
        {
          name: '--name',
          alias: '-n',
          description: 'Tab name (uses active if not provided)',
          type: 'string'
        },
        {
          name: '--file',
          alias: '-f',
          description: 'CSV file path',
          type: 'string',
          required: true
        },
        {
          name: '--skip-header',
          description: 'Skip header row when importing',
          type: 'boolean'
        }
      ],
      examples: [
        `${APP_INFO.name} sheet import -n "Sheet1" -f data.csv`,
        `${APP_INFO.name} sheet import -n "Sheet1" -f data.csv --skip-header`
      ]
    },
    {
      name: SubCommandNames.SHEET_EXPORT,
      description: 'Export sheet data to JSON or CSV format',
      flags: [
        {
          name: '--name',
          alias: '-n',
          description: 'Tab name (uses active if not provided)',
          type: 'string'
        },
        {
          name: '--range',
          alias: '-r',
          description: 'Range to export (optional)',
          type: 'string'
        },
        {
          name: '--format',
          alias: '-f',
          description: 'Export format',
          type: 'string',
          required: true,
          choices: ['json', 'csv']
        },
        {
          name: '--output',
          alias: '-o',
          description: 'Output file path',
          type: 'string'
        }
      ],
      examples: [
        `${APP_INFO.name} sheet export -n "Sheet1" -f json -o output.json`,
        `${APP_INFO.name} sheet export -n "Sheet1" -f csv -o output.csv`
      ]
    }
  ]
};
