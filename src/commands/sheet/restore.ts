import { existsSync, readdirSync, readFileSync } from 'fs';
import { join } from 'path';
import { Command } from 'commander';

import { ConfigManager } from '../../lib/config-manager.js';
import { GoogleSheetsService } from '../../lib/google-sheets.service.js';
import { Logger } from '../../lib/logger.js';

function parseCSV(content: string): string[][] {
  const lines = content.split('\n').filter(line => line.trim() !== '');
  const result: string[][] = [];

  for (const line of lines) {
    const row: string[] = [];
    let current = '';
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
      const char = line[i];

      if (char === '"') {
        if (inQuotes && line[i + 1] === '"') {
          current += '"';
          i++;
        } else {
          inQuotes = !inQuotes;
        }
      } else if (char === ',' && !inQuotes) {
        row.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }

    row.push(current.trim());
    result.push(row);
  }

  return result;
}

export function createRestoreCommand(): Command {
  return new Command('restore')
    .description('Restore tabs from a backup directory (preserves formulas)')
    .requiredOption('-i, --input <dir>', 'Backup directory to restore from')
    .option('-t, --tab <name>', 'Restore only this specific tab (if not specified, restores all tabs from backup)')
    .option('-s, --spreadsheet <name>', 'Spreadsheet name (uses active spreadsheet if not specified)')
    .option('--create-tabs', 'Create tabs if they don\'t exist')
    .action(async (options: {
      input: string;
      tab?: string;
      spreadsheet?: string;
      createTabs?: boolean;
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

        // Check if backup directory exists
        if (!existsSync(options.input)) {
          Logger.error(`Backup directory '${options.input}' not found`);
          process.exit(1);
        }

        // Read metadata
        const metadataPath = join(options.input, 'metadata.json');
        if (!existsSync(metadataPath)) {
          Logger.error('metadata.json not found in backup directory');
          process.exit(1);
        }

        const metadata = JSON.parse(readFileSync(metadataPath, 'utf-8'));
        const format = metadata.format || 'json';

        const sheetsService = new GoogleSheetsService({
          spreadsheetId: spreadsheet.spreadsheet_id,
          serviceAccountEmail: spreadsheet.service_account_email,
          privateKey: spreadsheet.private_key
        });

        // Get current sheets
        Logger.loading('Fetching current spreadsheet info...');
        const info = await sheetsService.getSheetInfo();
        const existingSheets = new Set(info.sheets.map(s => s.title));

        Logger.success(`Found backup from ${metadata.timestamp}`);
        Logger.info(`Backup contains ${metadata.tabs.length} tabs`);

        // Get all backup files
        let files = readdirSync(options.input).filter(f =>
          f.endsWith('.json') || f.endsWith('.csv')
        );

        // Filter for specific tab if requested
        if (options.tab) {
          const tabFileName = `${options.tab.replace(/[^a-zA-Z0-9-_]/g, '_')}.csv`;
          const tabFileNameJson = `${options.tab.replace(/[^a-zA-Z0-9-_]/g, '_')}.json`;

          files = files.filter(f => f === tabFileName || f === tabFileNameJson);

          if (files.length === 0) {
            Logger.error(`Tab '${options.tab}' not found in backup`);
            Logger.info(`Available tabs: ${metadata.tabs.join(', ')}`);
            process.exit(1);
          }
        }

        Logger.loading(`\nStarting restore of ${files.length} tab${files.length > 1 ? 's' : ''}...`);

        for (let i = 0; i < files.length; i++) {
          const file = files[i];
          const ext = file.split('.').pop();
          const tabName = file.replace(`.${ext}`, '').replace(/_/g, ' ');

          // Find the actual tab name from metadata
          const actualTabName = metadata.tabs.find((t: string) =>
            t.replace(/[^a-zA-Z0-9-_]/g, '_') === file.replace(`.${ext}`, '')
          ) || tabName;

          Logger.loading(`Restoring ${i + 1}/${files.length}: ${actualTabName}...`);

          // Create tab if it doesn't exist and --create-tabs is set
          if (!existingSheets.has(actualTabName)) {
            if (options.createTabs) {
              Logger.loading(`Creating tab '${actualTabName}'...`);
              await sheetsService.addSheet(actualTabName);
              existingSheets.add(actualTabName);
            } else {
              Logger.warning(`Tab '${actualTabName}' doesn't exist. Use --create-tabs to create it. Skipping...`);
              continue;
            }
          }

          // Read backup file
          const filePath = join(options.input, file);
          const content = readFileSync(filePath, 'utf-8');

          let data: string[][];

          if (ext === 'json') {
            const jsonData = JSON.parse(content);
            if (jsonData.length === 0) continue;

            const headers = Object.keys(jsonData[0]);
            const rows = jsonData.map((obj: Record<string, string>) =>
              headers.map(h => obj[h] || '')
            );
            data = [headers, ...rows];
          } else {
            data = parseCSV(content);
          }

          if (data.length === 0) continue;

          // Calculate the range for all data
          const numRows = data.length;
          const numCols = Math.max(...data.map(row => row.length));
          const endCol = String.fromCharCode(65 + numCols - 1);
          const range = `A1:${endCol}${numRows}`;

          Logger.loading(`Writing ${numRows} rows to ${actualTabName}...`);

          // Write all data at once using writeCellRange (preserves formulas)
          await sheetsService.writeCellRange(actualTabName, range, data);

          // Small delay between sheets to avoid rate limits
          await new Promise(resolve => setTimeout(resolve, 1000));
        }

        Logger.success(`\n✅ Restore completed successfully!`);
        if (options.tab) {
          Logger.info(`📊 Restored tab '${options.tab}' from ${metadata.timestamp}`);
        } else {
          Logger.info(`📊 Restored ${files.length} tabs from ${metadata.timestamp}`);
        }
      } catch (error) {
        Logger.error('Failed to restore from backup', error);
        process.exit(1);
      }
    });
}
