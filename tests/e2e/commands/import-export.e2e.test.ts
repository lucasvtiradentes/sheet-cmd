import fs from 'fs';
import os from 'os';
import path from 'path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { loadGlobalFixtures } from '../global-fixtures';
import { execCommand } from '../test-utils';

describe('Import/Export E2E', () => {
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

    tempTestDir = path.join(os.tmpdir(), `sheet-cmd-import-export-${Date.now()}`);
    fs.mkdirSync(tempTestDir, { recursive: true });
  });

  afterEach(() => {
    if (fs.existsSync(tempTestDir)) {
      fs.rmSync(tempTestDir, { recursive: true, force: true });
    }
  });

  it('should export sheet to JSON format', async () => {
    const outputFile = path.join(tempTestDir, 'export.json');

    await execCommand(
      `npm run dev -- sheet write-cell -n "${testTabName}" -r A1:E6 -v "ID,Name,Department,Salary,Years;101,John Doe,Engineering,85000,5;102,Jane Smith,Marketing,72000,3;103,Bob Johnson,Sales,68000,7;104,Alice Williams,HR,65000,4;105,Charlie Brown,Engineering,92000,8"`,
      undefined,
      15000,
      testHomeDir
    );

    const exportResult = await execCommand(
      `npm run dev -- sheet export -n "${testTabName}" -f json -o "${outputFile}"`,
      undefined,
      15000,
      testHomeDir
    );

    expect(exportResult.exitCode).toBe(0);
    expect(exportResult.stdout.toLowerCase()).toMatch(/export|success/);

    expect(fs.existsSync(outputFile)).toBe(true);

    const content = fs.readFileSync(outputFile, 'utf-8');
    const jsonData = JSON.parse(content);
    expect(jsonData.length).toBeGreaterThan(0);
    expect(jsonData[0]).toHaveProperty('Name');
  }, 45000);

  it('should export sheet to CSV format', async () => {
    const outputFile = path.join(tempTestDir, 'export.csv');

    await execCommand(
      `npm run dev -- sheet write-cell -n "${testTabName}" -r A1:D7 -v "Date,Product,Amount,Status;2024-01-15,Laptop,1299.99,Completed;2024-01-16,Mouse,29.99,Completed;2024-01-17,Keyboard,89.99,Pending;2024-01-18,Monitor,349.99,Completed;2024-01-19,Webcam,79.99,Shipped;2024-01-20,Headset,129.99,Completed"`,
      undefined,
      15000,
      testHomeDir
    );

    const exportResult = await execCommand(
      `npm run dev -- sheet export -n "${testTabName}" -f csv -o "${outputFile}"`,
      undefined,
      15000,
      testHomeDir
    );

    expect(exportResult.exitCode).toBe(0);
    expect(exportResult.stdout.toLowerCase()).toMatch(/export|success/);

    expect(fs.existsSync(outputFile)).toBe(true);

    const content = fs.readFileSync(outputFile, 'utf-8');
    expect(content).toContain('Date');
    expect(content).toContain('Laptop');
    expect(content.split('\n').length).toBeGreaterThan(5);
  }, 45000);

  it('should import CSV file to a new tab', async () => {
    const csvFile = path.join(tempTestDir, 'import.csv');
    const csvContent = `Customer,Email,Phone,City,Country
John Smith,john@email.com,555-0101,New York,USA
Maria Garcia,maria@email.com,555-0102,Madrid,Spain
Wei Zhang,wei@email.com,555-0103,Beijing,China
Sarah Johnson,sarah@email.com,555-0104,London,UK
Ahmed Hassan,ahmed@email.com,555-0105,Cairo,Egypt
Anna Kowalski,anna@email.com,555-0106,Warsaw,Poland
Carlos Silva,carlos@email.com,555-0107,São Paulo,Brazil
Yuki Tanaka,yuki@email.com,555-0108,Tokyo,Japan
Emma Wilson,emma@email.com,555-0109,Sydney,Australia
Pierre Dubois,pierre@email.com,555-0110,Paris,France`;

    fs.writeFileSync(csvFile, csvContent);

    const importTabName = `Import-Test-${Date.now()}`;

    await execCommand(`npm run dev -- sheet add-sheet -n "${importTabName}"`, undefined, 15000, testHomeDir);

    const importResult = await execCommand(
      `npm run dev -- sheet import-csv -n "${importTabName}" -f "${csvFile}"`,
      undefined,
      20000,
      testHomeDir
    );

    expect(importResult.exitCode).toBe(0);
    expect(importResult.stdout.toLowerCase()).toMatch(/imported|success/);

    await execCommand(`npm run dev -- sheet remove-sheet -n "${importTabName}"`, undefined, 15000, testHomeDir);
  }, 75000);


  it('should handle non-existent CSV file gracefully', async () => {
    const nonExistentFile = path.join(tempTestDir, 'does-not-exist.csv');

    const importResult = await execCommand(
      `npm run dev -- sheet import-csv -n "${testTabName}" -f "${nonExistentFile}"`,
      undefined,
      15000,
      testHomeDir
    );

    expect(importResult.exitCode !== 0 || importResult.stderr.length > 0).toBe(true);
  }, 30000);

  it('should export a specific range', async () => {
    const outputFile = path.join(tempTestDir, 'export-range.csv');

    await execCommand(
      `npm run dev -- sheet write-cell -n "${testTabName}" -r A1:E5 -v "SKU,Product,Stock,Price,Location;A001,Widget,150,9.99,Warehouse A;B002,Gadget,75,24.99,Warehouse B;C003,Tool,200,49.99,Warehouse A;D004,Device,50,99.99,Warehouse C"`,
      undefined,
      15000,
      testHomeDir
    );

    const exportResult = await execCommand(
      `npm run dev -- sheet export -n "${testTabName}" -r A1:C4 -f csv -o "${outputFile}"`,
      undefined,
      15000,
      testHomeDir
    );

    expect(exportResult.exitCode).toBe(0);
    expect(fs.existsSync(outputFile)).toBe(true);

    const content = fs.readFileSync(outputFile, 'utf-8');
    expect(content).toContain('SKU');
    expect(content).toContain('Widget');
    expect(content).not.toContain('Location'); // Should not include column E
  }, 45000);
});
