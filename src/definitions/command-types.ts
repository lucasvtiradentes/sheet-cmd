export type SheetListOptions = {
  output?: 'text' | 'json';
};

export type SheetActiveOptions = {
  output?: 'text' | 'json';
};

export type SheetSelectOptions = {
  name?: string;
};

export type SheetReadOptions = {
  name?: string;
  output?: 'markdown' | 'csv' | 'json';
  formulas?: boolean;
  export?: string;
  range?: string;
};

export type SheetAddOptions = {
  name: string;
};

export type SheetRemoveOptions = {
  name?: string;
};

export type SheetRenameOptions = {
  name?: string;
  newName: string;
};

export type SheetCopyOptions = {
  name?: string;
  to: string;
};

export type SheetWriteOptions = {
  name?: string;
  cell?: string;
  range?: string;
  value: string;
  preserve?: boolean;
};

export type SheetAppendOptions = {
  name?: string;
  value: string;
  values: string;
};

export type SheetImportOptions = {
  name?: string;
  file: string;
  skipHeader?: boolean;
};

export type SheetExportOptions = {
  name?: string;
  range?: string;
  format: 'json' | 'csv';
  output?: string;
};

export type SpreadsheetAddOptions = {
  id?: string;
  name?: string;
};

export type SpreadsheetListOptions = {
  output?: 'text' | 'json';
};

export type SpreadsheetActiveOptions = {
  output?: 'text' | 'json';
};

export type SpreadsheetSelectOptions = {
  id?: string;
  add?: boolean;
  name?: string;
};

export type SpreadsheetRemoveOptions = {
  id?: string;
};

export type RowAddOptions = {
  row: string;
  name?: string;
  above?: boolean;
  below?: boolean;
  formulas?: boolean;
  count?: string;
};

export type RowRemoveOptions = {
  row: string;
  name?: string;
  count?: string;
  above?: boolean;
  below?: boolean;
};
