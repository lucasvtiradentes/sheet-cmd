import { writeFileSync } from 'fs';
import { Command } from 'commander';

import { ConfigManager } from '../../lib/config-manager.js';
import { formatAsCSV, formatAsJSON } from '../../lib/data-formatters.js';
import { GoogleSheetsService } from '../../lib/google-sheets.service.js';
import { Logger } from '../../lib/logger.js';

type ExportFormat = 'json' | 'csv';

export function createExportCommand(): Command {
  return new Command('export')
    .description('Export sheet data to JSON or CSV format')
    .requiredOption('-t, --tab <name>', 'Tab/sheet name to export')
    .option('-r, --range <range>', 'Cell range to export (e.g., B2:I25). If not specified, exports all data')
    .option('-f, --format <type>', 'Output format: json, csv (default: json)', 'json')
    .option('-o, --output <file>', 'Output file path. If not specified, prints to console')
    .option('-s, --spreadsheet <name>', 'Spreadsheet name (uses active spreadsheet if not specified)')
    .action(async (options: {
      tab: string;
      range?: string;
      format: ExportFormat;
      output?: string;
      spreadsheet?: string
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

        const validFormats: ExportFormat[] = ['json', 'csv'];
        if (!validFormats.includes(options.format)) {
          Logger.error(`Invalid format '${options.format}'. Valid formats: ${validFormats.join(', ')}`);
          process.exit(1);
        }

        const sheetsService = new GoogleSheetsService({
          spreadsheetId: spreadsheet.spreadsheet_id,
          serviceAccountEmail: spreadsheet.service_account_email,
          privateKey: spreadsheet.private_key
        });

        Logger.loading(`Exporting data from '${options.tab}'${options.range ? ` (range: ${options.range})` : ''}...`);

        let data: string[][];
        if (options.range) {
          data = await sheetsService.getSheetDataRange(options.tab, options.range);
        } else {
          data = await sheetsService.getSheetData(options.tab);
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
    });
}
