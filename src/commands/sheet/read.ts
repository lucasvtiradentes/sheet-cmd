import { Command } from 'commander';
import { writeFileSync } from 'fs';
import { getGoogleSheetsService } from '../../core/command-helpers.js';
import { createSubCommandFromSchema } from '../../definitions/command-builder.js';
import type { SheetReadOptions } from '../../definitions/command-types.js';
import { CommandNames, SubCommandNames } from '../../definitions/types.js';
import { formatAsCSV, formatAsMarkdown } from '../../utils/formatters.js';
import { Logger } from '../../utils/logger.js';

type OutputFormat = 'markdown' | 'csv';

export function createReadCommand(): Command {
  return createSubCommandFromSchema(
    CommandNames.SHEET,
    SubCommandNames.SHEET_READ,
    async (options: SheetReadOptions) => {
      try {
        const validFormats: OutputFormat[] = ['markdown', 'csv'];
        if (!validFormats.includes(options.output)) {
          Logger.error(`Invalid output format '${options.output}'. Valid formats: ${validFormats.join(', ')}`);
          process.exit(1);
        }

        const sheetsService = await getGoogleSheetsService(options.spreadsheet);

        Logger.loading(`Reading sheet '${options.name}'...`);
        const includeFormulas = options.formulas ?? false;
        const data = await sheetsService.getSheetData(options.name, includeFormulas);

        if (data.length === 0) {
          Logger.warning('Sheet is empty');
          process.exit(0);
        }

        let output: string;
        if (options.output === 'markdown') {
          output = formatAsMarkdown(data);
        } else {
          output = formatAsCSV(data);
        }

        if (options.export) {
          writeFileSync(options.export, output, 'utf-8');
          Logger.success(`Content exported to ${options.export}`);
        } else {
          Logger.success(`Content of sheet '${options.name}':\n`);
          Logger.plain(output);
        }
      } catch (error) {
        Logger.error('Failed to read sheet', error);
        process.exit(1);
      }
    }
  );
}
