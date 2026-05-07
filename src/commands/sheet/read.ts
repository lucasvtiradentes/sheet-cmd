import { writeFileSync } from 'fs';
import { getActiveSheetName, getGoogleSheetsService } from '../../core/command-helpers';
import { formatAsCSV, formatAsJSON, formatAsMarkdown } from '../../utils/formatters';
import { Logger } from '../../utils/logger';
import { defineSubCommand, flag } from '../define';

type OutputFormat = 'markdown' | 'csv' | 'json';

export const readCommand = defineSubCommand({
  name: 'read',
  description: 'Read the complete content of a sheet',
  flags: [
    flag.string('--name', 'Tab name (uses active if not provided)', { alias: '-n' }),
    flag.string('--output', 'Output format', { alias: '-o' }),
    flag.boolean('--formulas', 'Include formulas instead of values', { alias: '-f' }),
    flag.string('--export', 'Export to file', { alias: '-e' }),
    flag.string('--range', 'Range to read (e.g., A1:B10)', { alias: '-r' })
  ],
  errorMessage: 'Failed to read sheet',
  action: async ({ options }) => {
    const validFormats: OutputFormat[] = ['markdown', 'csv', 'json'];
    const outputFormat = options.output ?? 'markdown';
    if (!isOutputFormat(outputFormat)) {
      Logger.error(`Invalid output format '${outputFormat}'. Valid formats: ${validFormats.join(', ')}`);
      process.exit(1);
    }

    const sheetsService = await getGoogleSheetsService();
    const sheetName = getActiveSheetName(options.name);

    if (outputFormat !== 'json' || options.export) {
      Logger.loading(`Reading sheet '${sheetName}'...`);
    }
    const includeFormulas = options.formulas ?? false;
    const data = options.range
      ? await sheetsService.getSheetDataRange(sheetName, options.range, includeFormulas)
      : await sheetsService.getSheetData(sheetName, includeFormulas);

    if (data.length === 0) {
      Logger.warning('Sheet is empty');
      process.exit(0);
    }

    let output: string;
    if (outputFormat === 'markdown') {
      output = formatAsMarkdown(data);
    } else if (outputFormat === 'csv') {
      output = formatAsCSV(data);
    } else {
      output = formatAsJSON(data);
    }

    if (options.export) {
      writeFileSync(options.export, output, 'utf-8');
      Logger.success(`Content exported to ${options.export}`);
    } else if (outputFormat === 'json') {
      Logger.plain(output);
    } else {
      Logger.success(`Content of sheet '${sheetName}':\n`);
      Logger.plain(output);
    }
  }
});

function isOutputFormat(value: string): value is OutputFormat {
  return ['markdown', 'csv', 'json'].includes(value);
}
