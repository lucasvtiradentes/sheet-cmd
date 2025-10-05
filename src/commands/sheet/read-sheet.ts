import { Command } from 'commander';
import { writeFileSync } from 'fs';

import { ConfigManager } from '../../lib/config-manager.js';
import { formatAsCSV, formatAsMarkdown } from '../../lib/data-formatters.js';
import { GoogleSheetsService } from '../../lib/google-sheets.service.js';
import { Logger } from '../../lib/logger.js';

type OutputFormat = 'markdown' | 'csv';

export function createReadSheetCommand(): Command {
  return new Command('read-sheet')
    .description('Read the complete content of a sheet')
    .requiredOption('-n, --name <name>', 'Sheet name to read')
    .option('-s, --spreadsheet <name>', 'Spreadsheet name (uses active spreadsheet if not specified)')
    .option('-o, --output <type>', 'Output format: markdown, csv (default: markdown)', 'markdown')
    .option('-f, --formulas', 'Include formulas instead of calculated values')
    .option('-e, --export <file>', 'Export output to file instead of displaying')
    .action(async (options: {
      name: string;
      spreadsheet?: string;
      output: OutputFormat;
      formulas?: boolean;
      export?: string;
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

        const validFormats: OutputFormat[] = ['markdown', 'csv'];
        if (!validFormats.includes(options.output)) {
          Logger.error(`Invalid output format '${options.output}'. Valid formats: ${validFormats.join(', ')}`);
          process.exit(1);
        }

        const sheetsService = new GoogleSheetsService({
          spreadsheetId: spreadsheet.spreadsheet_id,
          serviceAccountEmail: spreadsheet.service_account_email,
          privateKey: spreadsheet.private_key
        });

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
    });
}
