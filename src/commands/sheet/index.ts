import type { Program as CaporalProgram } from '@caporal/core';
import { createCommandFromSchema } from '../../definitions/command-builder';
import { CommandNames } from '../../definitions/types';
import { createAppendCommand } from './data_operations/append';
import { createWriteCommand } from './data_operations/write';
import { createExportCommand } from './import_export/export';
import { createImportCommand } from './import_export/import';
import { createListCommand } from './list';
import { createReadCommand } from './read';
import { createRowAddCommand } from './row_operations/add-row';
import { createRowRemoveCommand } from './row_operations/remove-row';
import { createActiveCommand } from './sheet_operations/active';
import { createAddCommand } from './sheet_operations/add';
import { createCopyCommand } from './sheet_operations/copy';
import { createRemoveCommand } from './sheet_operations/remove';
import { createRenameCommand } from './sheet_operations/rename';
import { createSelectCommand } from './sheet_operations/select';

export function createSheetCommand(program: CaporalProgram): void {
  createCommandFromSchema(program, CommandNames.SHEET);
  createListCommand(program);
  createActiveCommand(program);
  createSelectCommand(program);
  createReadCommand(program);
  createAddCommand(program);
  createRemoveCommand(program);
  createRenameCommand(program);
  createCopyCommand(program);
  createWriteCommand(program);
  createAppendCommand(program);
  createImportCommand(program);
  createExportCommand(program);
  createRowAddCommand(program);
  createRowRemoveCommand(program);
}
