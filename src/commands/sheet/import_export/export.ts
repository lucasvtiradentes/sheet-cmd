import { Command } from 'commander';
import { writeFileSync } from 'fs';

import { getGoogleSheetsService } from '../../../lib/command-helpers.js';
import { formatAsCSV, formatAsJSON } from '../../../lib/data-formatters.js';
import { Logger } from '../../../lib/logger.js';

type ExportFormat = 'json' | 'csv';

export function createExportCommand(): Command {
  return new Command('export')
    .description('Export sheet data to JSON or CSV format')
    .requiredOption('-n, --name <name>', 'Sheet name to export')
    .option('-r, --range <range>', 'Cell range to export (e.g., B2:I25). If not specified, exports all data')
    .option('-f, --format <type>', 'Output format: json, csv (default: json)', 'json')
    .option('-o, --output <file>', 'Output file path. If not specified, prints to console')
    .option('-s, --spreadsheet <name>', 'Spreadsheet name (uses active spreadsheet if not specified)')
    .action(
      async (options: {
        name: string;
        range?: string;
        format: ExportFormat;
        output?: string;
        spreadsheet?: string;
      }) => {
        try {
          const validFormats: ExportFormat[] = ['json', 'csv'];
          if (!validFormats.includes(options.format)) {
            Logger.error(`Invalid format '${options.format}'. Valid formats: ${validFormats.join(', ')}`);
            process.exit(1);
          }

          const sheetsService = await getGoogleSheetsService(options.spreadsheet);

          Logger.loading(
            `Exporting data from '${options.name}'${options.range ? ` (range: ${options.range})` : ''}...`
          );

          let data: string[][];
          if (options.range) {
            data = await sheetsService.getSheetDataRange(options.name, options.range);
          } else {
            data = await sheetsService.getSheetData(options.name);
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
