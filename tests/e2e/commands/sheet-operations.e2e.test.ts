import { beforeEach, describe, expect, it } from 'vitest';
import { loadGlobalFixtures } from '../global-fixtures';
import { execCommand } from '../test-utils';

describe('Sheet Operations E2E', () => {
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

  it('should read a sheet tab content', async () => {
    // First list tabs to get a tab name
    const listTabsResult = await execCommand('npm run dev -- spreadsheet list-tabs', undefined, 15000, testHomeDir);
    expect(listTabsResult.exitCode).toBe(0);

    // Extract first tab name from output (assuming format contains tab names)
    const tabMatch = listTabsResult.stdout.match(/\d+\.\s+(.+)/);
    if (!tabMatch) {
      console.log('No tabs found in spreadsheet, skipping read test');
      return;
    }

    const tabName = tabMatch[1].trim();

    // Ensure tab has content before reading
    await execCommand(
      `npm run dev -- sheet write-cell -t "${tabName}" -c A1 -v "Test Content"`,
      undefined,
      15000,
      testHomeDir
    );

    // Read the tab content - using -t flag without quotes in args
    const readResult = await execCommand(
      `npm run dev -- sheet read-sheet -t "${tabName}"`,
      undefined,
      15000,
      testHomeDir
    );

    expect(readResult.exitCode).toBe(0);
    expect(readResult.stdout).toContain('Content of sheet');
  }, 60000);

  it('should handle non-existent tab gracefully', async () => {
    const readResult = await execCommand(
      'npm run dev -- sheet read-sheet -t "NonExistentTab123"',
      undefined,
      15000,
      testHomeDir
    );

    // Should fail gracefully
    expect(readResult.exitCode !== 0 || readResult.stderr.length > 0 || readResult.stdout.includes('not found')).toBe(
      true
    );
  }, 30000);
});
