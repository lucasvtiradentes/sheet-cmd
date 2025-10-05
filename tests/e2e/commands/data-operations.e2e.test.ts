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
    const writeResult = await execCommand(
      `npm run dev -- sheet write-cell -t "${testTabName}" -r A1:B2 -v "A1,B1;A2,B2"`,
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

  it('should append a row', async () => {
    const appendResult = await execCommand(
      `npm run dev -- sheet append-row -t "${testTabName}" -v "New,Row,Data"`,
      undefined,
      15000,
      testHomeDir
    );

    expect(appendResult.exitCode).toBe(0);
    expect(appendResult.stdout.toLowerCase()).toMatch(/appended|success/);
  }, 30000);

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
