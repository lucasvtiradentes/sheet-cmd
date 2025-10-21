export interface CommandArgument {
  name: string;
  description: string;
  type: 'string' | 'number';
  required?: boolean;
}

export interface CommandFlag {
  name: string;
  alias?: string;
  description: string;
  type: 'string' | 'boolean' | 'number';
  required?: boolean;
  choices?: string[];
}

export interface SubCommand {
  name: string;
  aliases?: string[];
  description: string;
  arguments?: CommandArgument[];
  flags?: CommandFlag[];
  examples?: string[];
}

export interface Command {
  name: string;
  aliases?: string[];
  description: string;
  subcommands?: SubCommand[];
  flags?: CommandFlag[];
  examples?: string[];
}

export const CommandNames = {
  ACCOUNT: 'account',
  SPREADSHEET: 'spreadsheet',
  SHEET: 'sheet',
  UPDATE: 'update',
  COMPLETION: 'completion'
} as const;

export const SubCommandNames = {
  ACCOUNT_ADD: 'add',
  ACCOUNT_LIST: 'list',
  ACCOUNT_SELECT: 'select',
  ACCOUNT_REMOVE: 'remove',
  ACCOUNT_REAUTH: 'reauth',

  SPREADSHEET_ADD: 'add',
  SPREADSHEET_LIST: 'list',
  SPREADSHEET_SELECT: 'select',
  SPREADSHEET_ACTIVE: 'active',
  SPREADSHEET_REMOVE: 'remove',

  SHEET_LIST: 'list',
  SHEET_SELECT: 'select',
  SHEET_READ: 'read',
  SHEET_ADD: 'add',
  SHEET_REMOVE: 'remove',
  SHEET_RENAME: 'rename',
  SHEET_COPY: 'copy',
  SHEET_WRITE: 'write',
  SHEET_APPEND: 'append',
  SHEET_IMPORT: 'import',
  SHEET_EXPORT: 'export',

  COMPLETION_INSTALL: 'install'
} as const;
