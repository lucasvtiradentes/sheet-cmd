import { Command } from 'commander';
import { writeFileSync } from 'fs';
import { getActiveSheetName, getGoogleSheetsService } from '../../core/command-helpers.js';
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
        const outputFormat = options.output ?? 'markdown';
        const validFormats: OutputFormat[] = ['markdown', 'csv'];
        if (!validFormats.includes(outputFormat)) {
          Logger.error(`Invalid output format '${outputFormat}'. Valid formats: ${validFormats.join(', ')}`);
          process.exit(1);
        }

        const sheetsService = await getGoogleSheetsService();
        const sheetName = getActiveSheetName(options.name);

        Logger.loading(`Reading sheet '${sheetName}'...`);
        const includeFormulas = options.formulas ?? false;
        const data = await sheetsService.getSheetData(sheetName, includeFormulas);

        if (data.length === 0) {
          Logger.warning('Sheet is empty');
          process.exit(0);
        }

        let output: string;
        if (outputFormat === 'markdown') {
          output = formatAsMarkdown(data);
        } else {
          output = formatAsCSV(data);
        }

        if (options.export) {
          writeFileSync(options.export, output, 'utf-8');
          Logger.success(`Content exported to ${options.export}`);
        } else {
          Logger.success(`Content of sheet '${sheetName}':\n`);
          Logger.plain(output);
        }
      } catch (error) {
        Logger.error('Failed to read sheet', error);
        process.exit(1);
      }
    }
  );
}
