import { mkdirSync, writeFileSync } from 'fs';
import { join } from 'path';
import { Command } from 'commander';

import { ConfigManager } from '../../lib/config-manager.js';
import { GoogleSheetsService } from '../../lib/google-sheets.service.js';
import { Logger } from '../../lib/logger.js';

export function createBackupCommand(): Command {
  return new Command('backup')
    .description('Backup tabs from the spreadsheet in CSV format with formulas preserved')
    .requiredOption('-o, --output <dir>', 'Output directory for backup')
    .option('-t, --tab <name>', 'Backup only this specific tab (if not specified, backs up all tabs)')
    .option('-s, --spreadsheet <name>', 'Spreadsheet name (uses active spreadsheet if not specified)')
    .action(async (options: {
      output: string;
      tab?: string;
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

        const sheetsService = new GoogleSheetsService({
          spreadsheetId: spreadsheet.spreadsheet_id,
          serviceAccountEmail: spreadsheet.service_account_email,
          privateKey: spreadsheet.private_key
        });

        // Get all sheets
        Logger.loading('Fetching spreadsheet info...');
        const info = await sheetsService.getSheetInfo();

        // Filter sheets if specific tab is requested
        let sheetsToBackup = info.sheets;
        if (options.tab) {
          const targetSheet = info.sheets.find(s => s.title === options.tab);
          if (!targetSheet) {
            Logger.error(`Tab '${options.tab}' not found in spreadsheet`);
            process.exit(1);
          }
          sheetsToBackup = [targetSheet];
        }

        // Create backup directory with timestamp
        const timestamp = new Date().toISOString().replace(/:/g, '-').split('.')[0];
        const backupDir = join(options.output, timestamp);
        mkdirSync(backupDir, { recursive: true });

        // Create metadata file
        const metadata = {
          timestamp,
          spreadsheetTitle: info.title,
          spreadsheetName,
          format: 'csv-raw',
          tabs: sheetsToBackup.map(s => s.title)
        };
        writeFileSync(
          join(backupDir, 'metadata.json'),
          JSON.stringify(metadata, null, 2),
          'utf-8'
        );

        Logger.success(`Backup directory created: ${backupDir}`);
        Logger.loading(`Backing up ${sheetsToBackup.length} tab${sheetsToBackup.length > 1 ? 's' : ''} with formulas...`);

        // Backup each sheet with formulas
        for (let i = 0; i < sheetsToBackup.length; i++) {
          const sheet = sheetsToBackup[i];
          Logger.loading(`Backing up ${i + 1}/${sheetsToBackup.length}: ${sheet.title}...`);

          // Get data with formulas preserved
          const data = await sheetsService.getSheetData(sheet.title, true);

          if (data.length === 0) {
            Logger.warning(`Tab '${sheet.title}' is empty, skipping...`);
            continue;
          }

          // Convert to CSV format
          const content = data
            .map(row =>
              row
                .map(cell => {
                  const value = cell || '';
                  if (value.includes(',') || value.includes('"') || value.includes('\n')) {
                    return `"${value.replace(/"/g, '""')}"`;
                  }
                  return value;
                })
                .join(',')
            )
            .join('\n');

          const filename = `${sheet.title.replace(/[^a-zA-Z0-9-_]/g, '_')}.csv`;
          writeFileSync(join(backupDir, filename), content, 'utf-8');
        }

        Logger.success(`\n✅ Backup completed successfully!`);
        Logger.info(`📁 Backup location: ${backupDir}`);
        if (options.tab) {
          Logger.info(`📊 Backed up tab '${options.tab}' in CSV format with formulas preserved`);
        } else {
          Logger.info(`📊 Backed up ${sheetsToBackup.length} tabs in CSV format with formulas preserved`);
        }
      } catch (error) {
        Logger.error('Failed to backup spreadsheet', error);
        process.exit(1);
      }
    });
}
