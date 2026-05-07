import { writeFileSync } from 'fs';
import { defineSubCommand, flag } from '../../cli/define';
import { getActiveSheetName, getGoogleSheetsService } from '../../core/command-helpers';
import { formatAsCSV, formatAsJSON, formatAsMarkdown } from '../../utils/formatters';
import { Logger } from '../../utils/logger';

enum OutputFormat {
  Csv = 'csv',
  Json = 'json',
  Markdown = 'markdown'
}

const outputFormats = Object.values(OutputFormat);

const outputFormatters = {
  [OutputFormat.Csv]: formatAsCSV,
  [OutputFormat.Json]: formatAsJSON,
  [OutputFormat.Markdown]: formatAsMarkdown
} as const satisfies Record<OutputFormat, (data: string[][]) => string>;

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
    const outputFormat = options.output ?? OutputFormat.Markdown;
    if (!isOutputFormat(outputFormat)) {
      Logger.error(`Invalid output format '${outputFormat}'. Valid formats: ${outputFormats.join(', ')}`);
      process.exit(1);
    }

    const sheetsService = await getGoogleSheetsService();
    const sheetName = getActiveSheetName(options.name);

    if (outputFormat !== OutputFormat.Json || options.export) {
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

    const output = outputFormatters[outputFormat](data);

    if (options.export) {
      writeFileSync(options.export, output, 'utf-8');
      Logger.success(`Content exported to ${options.export}`);
    } else if (outputFormat === OutputFormat.Json) {
      Logger.plain(output);
    } else {
      Logger.success(`Content of sheet '${sheetName}':\n`);
      Logger.plain(output);
    }
  }
});

function isOutputFormat(value: string): value is OutputFormat {
  return (outputFormats as readonly string[]).includes(value);
}
