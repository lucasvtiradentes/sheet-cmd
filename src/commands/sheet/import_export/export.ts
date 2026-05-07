import { writeFileSync } from 'fs';
import { getActiveSheetName, getGoogleSheetsService } from '../../../core/command-helpers';
import { formatAsCSV, formatAsJSON } from '../../../utils/formatters';
import { Logger } from '../../../utils/logger';
import { defineSubCommand, flag } from '../../define';

type ExportFormat = 'json' | 'csv';

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
    const validFormats: ExportFormat[] = ['json', 'csv'];
    if (!isExportFormat(options.format)) {
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
  }
});

function isExportFormat(value: string): value is ExportFormat {
  return ['json', 'csv'].includes(value);
}
