import { Command } from 'commander';
import { writeFileSync } from 'fs';
import { getActiveSheetName, getGoogleSheetsService } from '../../../core/command-helpers.js';
import { createSubCommandFromSchema } from '../../../definitions/command-builder.js';
import type { SheetExportOptions } from '../../../definitions/command-types.js';
import { CommandNames, SubCommandNames } from '../../../definitions/types.js';
import { formatAsCSV, formatAsJSON } from '../../../utils/formatters.js';
import { Logger } from '../../../utils/logger.js';

type ExportFormat = 'json' | 'csv';

export function createExportCommand(): Command {
  return createSubCommandFromSchema(
    CommandNames.SHEET,
    SubCommandNames.SHEET_EXPORT,
    async (options: SheetExportOptions) => {
      try {
        const validFormats: ExportFormat[] = ['json', 'csv'];
        if (!validFormats.includes(options.format)) {
          Logger.error(`Invalid format '${options.format}'. Valid formats: ${validFormats.join(', ')}`);
          process.exit(1);
        }

        const sheetsService = await getGoogleSheetsService();
        const sheetName = getActiveSheetName(options.name);

        Logger.loading(`Exporting data from '${sheetName}'${options.range ? ` (range: ${options.range})` : ''}...`);

        let data: string[][];
        if (options.range) {
          data = await sheetsService.getSheetDataRange(sheetName, options.range);
        } else {
          data = await sheetsService.getSheetData(sheetName);
        }

        if (data.length === 0) {
          Logger.warning('No data to export');
          process.exit(0);
        }

        let output: string;
        if (options.format === 'json') {
          output = formatAsJSON(data);
        } else {
          output = formatAsCSV(data);
        }

        if (options.output) {
          writeFileSync(options.output, output, 'utf-8');
          Logger.success(`Data exported to ${options.output}`);
        } else {
          Logger.success('Exported data:\n');
          Logger.plain(output);
        }
      } catch (error) {
        Logger.error('Failed to export data', error);
        process.exit(1);
      }
    }
  );
}
