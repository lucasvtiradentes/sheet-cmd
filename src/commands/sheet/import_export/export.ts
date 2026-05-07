import { writeFileSync } from 'fs';
import { defineSubCommand, flag } from '../../../cli/define';
import { getActiveSheetName, getGoogleSheetsService } from '../../../core/command-helpers';
import { formatAsCSV, formatAsJSON } from '../../../utils/formatters';
import { Logger } from '../../../utils/logger';

enum ExportFormat {
  Csv = 'csv',
  Json = 'json'
}

const exportFormats = Object.values(ExportFormat);

const exportFormatters = {
  [ExportFormat.Csv]: formatAsCSV,
  [ExportFormat.Json]: formatAsJSON
} as const satisfies Record<ExportFormat, (data: string[][]) => string>;

export const exportCommand = defineSubCommand({
  name: 'export',
  description: 'Export sheet data to JSON or CSV format',
  flags: [
    flag.string('--name', 'Tab name (uses active if not provided)', { alias: '-n' }),
    flag.string('--range', 'Range to export (optional)', { alias: '-r' }),
    flag.string('--format', 'Export format', { alias: '-f', required: true }),
    flag.string('--output', 'Output file path', { alias: '-o' })
  ],
  errorMessage: 'Failed to export data',
  action: async ({ options }) => {
    if (!isExportFormat(options.format)) {
      Logger.error(`Invalid format '${options.format}'. Valid formats: ${exportFormats.join(', ')}`);
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

    const output = exportFormatters[options.format](data);

    if (options.output) {
      writeFileSync(options.output, output, 'utf-8');
      Logger.success(`Data exported to ${options.output}`);
    } else {
      Logger.success('Exported data:\n');
      Logger.plain(output);
    }
  }
});

function isExportFormat(value: string): value is ExportFormat {
  return (exportFormats as readonly string[]).includes(value);
}
