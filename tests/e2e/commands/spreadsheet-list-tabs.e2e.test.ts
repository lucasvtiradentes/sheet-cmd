import { beforeEach, describe, expect, it } from 'vitest';
import { loadGlobalFixtures } from '../global-fixtures';
import { execCommand } from '../test-utils';

describe('Spreadsheet List Tabs E2E', () => {
  let testHomeDir: string;

  beforeEach(async () => {
    const fixtures = loadGlobalFixtures();

    if (!fixtures) {
      throw new Error('Global fixtures not available. E2E tests require global setup.');
    }

    testHomeDir = fixtures.testHomeDir;
  });

  it('should list tabs from the test spreadsheet', async () => {
    const listTabsResult = await execCommand('npm run dev -- spreadsheet list-tabs', undefined, 15000, testHomeDir);

    expect(listTabsResult.exitCode).toBe(0);
    expect(listTabsResult.stdout).toContain('Tabs');
    expect(listTabsResult.stdout).toContain('sheet-cmd-test');

    // Should list at least one tab
    expect(listTabsResult.stdout.length).toBeGreaterThan(0);
  }, 30000);
});
