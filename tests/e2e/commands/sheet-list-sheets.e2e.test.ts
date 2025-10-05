import { beforeEach, describe, expect, it } from 'vitest';
import { loadGlobalFixtures } from '../global-fixtures';
import { execCommand } from '../test-utils';

describe('Sheet List Sheets E2E', () => {
  let testHomeDir: string;

  beforeEach(async () => {
    const fixtures = loadGlobalFixtures();

    if (!fixtures) {
      throw new Error('Global fixtures not available. E2E tests require global setup.');
    }

    testHomeDir = fixtures.testHomeDir;
  });

  it('should list sheets from the test spreadsheet', async () => {
    const listSheetsResult = await execCommand('npm run dev -- sheet list-sheets', undefined, 15000, testHomeDir);

    expect(listSheetsResult.exitCode).toBe(0);
    expect(listSheetsResult.stdout).toContain('Sheets');
    expect(listSheetsResult.stdout).toContain('sheet-cmd-test');

    // Should list at least one sheet
    expect(listSheetsResult.stdout.length).toBeGreaterThan(0);
  }, 30000);
});
