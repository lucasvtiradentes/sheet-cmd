import type { Program as CaporalProgram } from '@caporal/core';
import { writeFileSync } from 'fs';
import { getActiveSheetName, getGoogleSheetsService } from '../../core/command-helpers';
import { createSubCommandFromSchema } from '../../definitions/command-builder';
import type { SheetReadOptions } from '../../definitions/command-types';
import { CommandNames, SubCommandNames } from '../../definitions/types';
import { formatAsCSV, formatAsJSON, formatAsMarkdown } from '../../utils/formatters';
import { Logger } from '../../utils/logger';

type OutputFormat = 'markdown' | 'csv' | 'json';

export function createReadCommand(program: CaporalProgram): void {
  const sheetReadCommand = async (options: SheetReadOptions) => {
    const outputFormat = options.output ?? 'markdown';
    const validFormats: OutputFormat[] = ['markdown', 'csv', 'json'];
    if (!validFormats.includes(outputFormat)) {
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
  };

  createSubCommandFromSchema(
    program,
    CommandNames.SHEET,
    SubCommandNames.SHEET_READ,
    sheetReadCommand,
    'Failed to read sheet'
  );
}
