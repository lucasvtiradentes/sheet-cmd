import { beforeEach, describe, expect, it } from 'vitest';
import { loadGlobalFixtures } from '../../configs/e2e-global-fixtures';
import { execCommand } from '../../configs/e2e-test-utils';

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
    const listSheetsResult = await execCommand('sheet list', undefined, 15000, testHomeDir);

    expect(listSheetsResult.exitCode).toBe(0);
    expect(listSheetsResult.stdout).toContain('Sheets');
    expect(listSheetsResult.stdout).toContain('sheet-cmd-test');

    expect(listSheetsResult.stdout.length).toBeGreaterThan(0);
  }, 30000);
});
