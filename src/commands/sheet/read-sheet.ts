import { Command } from 'commander';
import { writeFileSync } from 'fs';

import { ConfigManager } from '../../lib/config-manager.js';
import { formatAsCSV, formatAsMarkdown } from '../../lib/data-formatters.js';
import { GoogleSheetsService } from '../../lib/google-sheets.service.js';
import { Logger } from '../../lib/logger.js';

type OutputFormat = 'markdown' | 'csv' | 'csv-raw';

export function createReadSheetCommand(): Command {
  return new Command('read-sheet')
    .description('Read the complete content of a sheet tab')
    .requiredOption('-t, --tab <name>', 'Tab/sheet name to read')
    .option('-s, --spreadsheet <name>', 'Spreadsheet name (uses active spreadsheet if not specified)')
    .option('-f, --format <type>', 'Output format: markdown, csv, csv-raw (default: markdown)', 'markdown')
    .option('-o, --output <file>', 'Save output to file instead of displaying')
    .action(async (options: {
      tab: string;
      spreadsheet?: string;
      format: OutputFormat;
      output?: string;
    }) => {
      try {
        const configManager = new ConfigManager();

        let spreadsheetName = options.spreadsheet;

        if (!spreadsheetName) {
          const activeSpreadsheet = configManager.getActiveSpreadsheet();
          if (!activeSpreadsheet) {
            Logger.error('No spreadsheet specified and no active spreadsheet set.');
            Logger.info('Use --spreadsheet flag or run: sheet-cmd spreadsheet switch <name>');
            process.exit(1);
          }
          spreadsheetName = activeSpreadsheet.name;
        }

        const spreadsheet = configManager.getSpreadsheet(spreadsheetName);

        if (!spreadsheet) {
          Logger.error(`Spreadsheet '${spreadsheetName}' not found. Use "sheet-cmd spreadsheet add" to add one.`);
          process.exit(1);
        }

        const validFormats: OutputFormat[] = ['markdown', 'csv', 'csv-raw'];
        if (!validFormats.includes(options.format)) {
          Logger.error(`Invalid format '${options.format}'. Valid formats: ${validFormats.join(', ')}`);
          process.exit(1);
        }

        const sheetsService = new GoogleSheetsService({
          spreadsheetId: spreadsheet.spreadsheet_id,
          serviceAccountEmail: spreadsheet.service_account_email,
          privateKey: spreadsheet.private_key
        });

        Logger.loading(`Reading sheet '${options.tab}'...`);
        const includeFormulas = options.format === 'csv-raw';
        const data = await sheetsService.getSheetData(options.tab, includeFormulas);

        if (data.length === 0) {
          Logger.warning('Sheet is empty');
          process.exit(0);
        }

        let output: string;
        if (options.format === 'markdown') {
          output = formatAsMarkdown(data);
        } else {
          output = formatAsCSV(data);
        }

        if (options.output) {
          writeFileSync(options.output, output, 'utf-8');
          Logger.success(`Content saved to ${options.output}`);
        } else {
          Logger.success(`Content of sheet '${options.tab}':\n`);
          Logger.plain(output);
        }
      } catch (error) {
        Logger.error('Failed to read sheet', error);
        process.exit(1);
      }
    });
}
