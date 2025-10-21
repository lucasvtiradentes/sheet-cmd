import { Command } from 'commander';
import { createCommandFromSchema } from '../../definitions/command-builder.js';
import { CommandNames } from '../../definitions/types.js';
import { createAppendCommand } from './data_operations/append.js';
import { createWriteCommand } from './data_operations/write.js';
import { createExportCommand } from './import_export/export.js';
import { createImportCommand } from './import_export/import.js';
import { createListCommand } from './list.js';
import { createReadCommand } from './read.js';
import { createAddCommand } from './sheet_operations/add.js';
import { createCopyCommand } from './sheet_operations/copy.js';
import { createRemoveCommand } from './sheet_operations/remove.js';
import { createRenameCommand } from './sheet_operations/rename.js';
import { createSelectCommand } from './sheet_operations/select.js';

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

  return sheet;
}
