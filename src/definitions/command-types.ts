import type { SubCommand } from './types.js';

export type FlagType<T extends SubCommand> = T extends { flags: Array<infer F> }
  ? F extends { name: string; type: infer Type; required?: boolean }
    ? Type extends 'string'
      ? string
      : Type extends 'number'
        ? number
        : Type extends 'boolean'
          ? boolean
          : never
    : never
  : never;

export type FlagsToOptions<T extends SubCommand> = T extends { flags: ReadonlyArray<infer F> }
  ? F extends { name: infer N; alias?: string; type: infer Type; required?: infer Req }
    ? N extends string
      ? {
          [K in N extends `--${infer Name}` ? Name : N]: Type extends 'string'
            ? Req extends true
              ? string
              : string | undefined
            : Type extends 'number'
              ? Req extends true
                ? number
                : number | undefined
              : Type extends 'boolean'
                ? boolean | undefined
                : never;
        }
      : never
    : never
  : Record<string, never>;

export type SubCommandOptions<T extends SubCommand> = T extends { flags: ReadonlyArray<unknown> }
  ? UnionToIntersection<FlagsToOptions<T>>
  : Record<string, never>;

type UnionToIntersection<U> = (U extends unknown ? (k: U) => void : never) extends (k: infer I) => void ? I : never;

export type SheetListOptions = Record<string, never>;

export type SheetSelectOptions = {
  name?: string;
};

export type SheetReadOptions = {
  name?: string;
  output?: 'markdown' | 'csv';
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
};

export type AccountSelectOptions = {
  email?: string;
};

export type AccountRemoveOptions = {
  email?: string;
};

export type SpreadsheetSelectOptions = {
  id?: string;
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
