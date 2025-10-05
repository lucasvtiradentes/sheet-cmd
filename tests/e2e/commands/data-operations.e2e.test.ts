import { beforeEach, describe, expect, it } from 'vitest';
import { loadGlobalFixtures } from '../global-fixtures';
import { execCommand } from '../test-utils';

describe('Data Operations E2E', () => {
  let testHomeDir: string;
  let testTabName: string;

  beforeEach(async () => {
    const fixtures = loadGlobalFixtures();

    if (!fixtures) {
      throw new Error('Global fixtures not available. E2E tests require global setup.');
    }

    testHomeDir = fixtures.testHomeDir;
    testTabName = fixtures.testTabName;
  });

  it('should write to a single cell', async () => {
    const writeResult = await execCommand(
      `npm run dev -- sheet write-cell -t "${testTabName}" -c A1 -v "Test Value"`,
      undefined,
      15000,
      testHomeDir
    );

    expect(writeResult.exitCode).toBe(0);
    expect(writeResult.stdout.toLowerCase()).toMatch(/updated|success/);
  }, 30000);

  it('should write to a range of cells', async () => {
    // Write a larger range with more realistic data (5 rows x 4 columns)
    const writeResult = await execCommand(
      `npm run dev -- sheet write-cell -t "${testTabName}" -r A1:D5 -v "Product,Price,Quantity,Total;Laptop,999.99,2,1999.98;Mouse,29.99,5,149.95;Keyboard,79.99,3,239.97;Monitor,299.99,1,299.99"`,
      undefined,
      15000,
      testHomeDir
    );

    expect(writeResult.exitCode).toBe(0);
    expect(writeResult.stdout.toLowerCase()).toMatch(/updated|success/);
  }, 30000);

  it('should handle dimension mismatch error', async () => {
    const writeResult = await execCommand(
      `npm run dev -- sheet write-cell -t "${testTabName}" -r A1:C3 -v "value1,value2"`,
      undefined,
      15000,
      testHomeDir
    );

    expect(writeResult.exitCode !== 0 || writeResult.stderr.length > 0 || writeResult.stdout.includes('mismatch')).toBe(
      true
    );
  }, 30000);

  it('should append multiple rows', async () => {
    // Append first row
    const appendResult1 = await execCommand(
      `npm run dev -- sheet append-row -t "${testTabName}" -v "Scanner,149.99,2,299.98"`,
      undefined,
      15000,
      testHomeDir
    );
    expect(appendResult1.exitCode).toBe(0);

    // Append second row
    const appendResult2 = await execCommand(
      `npm run dev -- sheet append-row -t "${testTabName}" -v "Webcam,89.99,4,359.96"`,
      undefined,
      15000,
      testHomeDir
    );
    expect(appendResult2.exitCode).toBe(0);

    // Append third row
    const appendResult3 = await execCommand(
      `npm run dev -- sheet append-row -t "${testTabName}" -v "Headset,59.99,3,179.97"`,
      undefined,
      15000,
      testHomeDir
    );
    expect(appendResult3.exitCode).toBe(0);
    expect(appendResult3.stdout.toLowerCase()).toMatch(/appended|success/);
  }, 60000);

  it('should read sheet content in different formats', async () => {
    // Test markdown format (default with -o flag)
    const markdownResult = await execCommand(
      `npm run dev -- sheet read-sheet -t "${testTabName}" -o markdown`,
      undefined,
      15000,
      testHomeDir
    );
    expect(markdownResult.exitCode).toBe(0);
    expect(markdownResult.stdout).toContain('Content of sheet');

    // Test CSV format
    const csvResult = await execCommand(
      `npm run dev -- sheet read-sheet -t "${testTabName}" -o csv`,
      undefined,
      15000,
      testHomeDir
    );
    expect(csvResult.exitCode).toBe(0);
  }, 60000);

  it('should handle write operations with missing flags', async () => {
    const writeResult = await execCommand(
      `npm run dev -- sheet write-cell -t "${testTabName}" -v "value"`,
      undefined,
      15000,
      testHomeDir
    );

    expect(writeResult.exitCode !== 0 || writeResult.stderr.length > 0).toBe(true);
  }, 30000);
});
