import { Command } from 'commander';
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
import { createAddCommand } from './sheet_operations/add';
import { createCopyCommand } from './sheet_operations/copy';
import { createRemoveCommand } from './sheet_operations/remove';
import { createRenameCommand } from './sheet_operations/rename';
import { createSelectCommand } from './sheet_operations/select';

export function createSheetCommand(): Command {
  const sheet = createCommandFromSchema(CommandNames.SHEET);

  sheet.addCommand(createListCommand());
  sheet.addCommand(createSelectCommand());
  sheet.addCommand(createReadCommand());
  sheet.addCommand(createAddCommand());
  sheet.addCommand(createRemoveCommand());
  sheet.addCommand(createRenameCommand());
  sheet.addCommand(createCopyCommand());
  sheet.addCommand(createWriteCommand());
  sheet.addCommand(createAppendCommand());
  sheet.addCommand(createImportCommand());
  sheet.addCommand(createExportCommand());
  sheet.addCommand(createRowAddCommand());
  sheet.addCommand(createRowRemoveCommand());

  return sheet;
}
