import fs from 'fs';
import os from 'os';
import path from 'path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { loadGlobalFixtures } from '../global-fixtures';
import { execCommand } from '../test-utils';

describe('Advanced Features E2E', () => {
  let testHomeDir: string;
  let testTabName: string;
  let tempTestDir: string;

  beforeEach(async () => {
    const fixtures = loadGlobalFixtures();

    if (!fixtures) {
      throw new Error('Global fixtures not available. E2E tests require global setup.');
    }

    testHomeDir = fixtures.testHomeDir;
    testTabName = fixtures.testTabName;

    // Create a temporary directory for test files
    tempTestDir = path.join(os.tmpdir(), `sheet-cmd-advanced-${Date.now()}`);
    fs.mkdirSync(tempTestDir, { recursive: true });
  });

  afterEach(() => {
    // Clean up temp directory
    if (fs.existsSync(tempTestDir)) {
      fs.rmSync(tempTestDir, { recursive: true, force: true });
    }
  });

  it('should read sheet with formulas flag', async () => {
    // First write a formula to a cell
    await execCommand(
      `npm run dev -- sheet write-cell -n "${testTabName}" -c B1 -v "=SUM(A1:A5)"`,
      undefined,
      15000,
      testHomeDir
    );

    // Read with formulas flag
    const readResult = await execCommand(
      `npm run dev -- sheet read-sheet -n "${testTabName}" -f`,
      undefined,
      15000,
      testHomeDir
    );

    expect(readResult.exitCode).toBe(0);
    expect(readResult.stdout).toContain('=SUM');
  }, 30000);

  it('should export sheet content to file using read-sheet', async () => {
    const outputFile = path.join(tempTestDir, 'exported-sheet.md');

    // Write some test data
    await execCommand(
      `npm run dev -- sheet write-cell -n "${testTabName}" -r A1:B3 -v "Name,Age;Alice,30;Bob,25"`,
      undefined,
      15000,
      testHomeDir
    );

    // Export to file using -e flag
    const exportResult = await execCommand(
      `npm run dev -- sheet read-sheet -n "${testTabName}" -e "${outputFile}"`,
      undefined,
      15000,
      testHomeDir
    );

    expect(exportResult.exitCode).toBe(0);
    expect(exportResult.stdout.toLowerCase()).toMatch(/export|success/);
    expect(fs.existsSync(outputFile)).toBe(true);

    const content = fs.readFileSync(outputFile, 'utf-8');
    expect(content).toContain('Alice');
    expect(content).toContain('Bob');
  }, 30000);

  it('should import CSV with --skip-header flag', async () => {
    const csvFile = path.join(tempTestDir, 'skip-header-test.csv');
    const csvContent = `Name,Email,Age\nJohn,john@example.com,30\nJane,jane@example.com,25`;
    fs.writeFileSync(csvFile, csvContent);

    const skipHeaderTab = `Skip-Header-${Date.now()}`;

    // Create sheet
    const createResult = await execCommand(
      `npm run dev -- sheet add-sheet -n "${skipHeaderTab}"`,
      undefined,
      15000,
      testHomeDir
    );

    if (createResult.exitCode !== 0) {
      console.log('Failed to create sheet:', createResult.stderr);
    }

    // Import with --skip-header (should import only the 2 data rows, skipping "Name,Email,Age")
    const importResult = await execCommand(
      `npm run dev -- sheet import-csv -n "${skipHeaderTab}" -f "${csvFile}" --skip-header`,
      undefined,
      20000,
      testHomeDir
    );

    // Log output for debugging if it fails
    if (importResult.exitCode !== 0) {
      console.log('Import stdout:', importResult.stdout);
      console.log('Import stderr:', importResult.stderr);
    }

    expect(importResult.exitCode).toBe(0);
    expect(importResult.stdout.toLowerCase()).toMatch(/imported|success/);

    // Clean up
    await execCommand(`npm run dev -- sheet remove-sheet -n "${skipHeaderTab}"`, undefined, 15000, testHomeDir);
  }, 60000);
});
