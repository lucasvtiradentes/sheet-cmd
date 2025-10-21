import { beforeEach, describe, expect, it } from 'vitest';
import { loadGlobalFixtures } from '../global-fixtures';
import { execCommand } from '../test-utils';

describe('Read Sheet E2E', () => {
  let testHomeDir: string;

  beforeEach(async () => {
    const fixtures = loadGlobalFixtures();

    if (!fixtures) {
      throw new Error('Global fixtures not available. E2E tests require global setup.');
    }

    testHomeDir = fixtures.testHomeDir;
  });

  it('should read a sheet tab content', async () => {
    const listTabsResult = await execCommand('npm run dev -- sheet list-sheets', undefined, 15000, testHomeDir);
    expect(listTabsResult.exitCode).toBe(0);

    const tabMatch = listTabsResult.stdout.match(/\d+\.\s+(.+)/);
    if (!tabMatch) {
      console.log('No tabs found in spreadsheet, skipping read test');
      return;
    }

    const tabName = tabMatch[1].trim();

    await execCommand(
      `npm run dev -- sheet write-cell -n "${tabName}" -c A1 -v "Test Content"`,
      undefined,
      15000,
      testHomeDir
    );

    const readResult = await execCommand(
      `npm run dev -- sheet read-sheet -n "${tabName}"`,
      undefined,
      15000,
      testHomeDir
    );

    expect(readResult.exitCode).toBe(0);
    expect(readResult.stdout).toContain('Content of sheet');
  }, 60000);

  it('should handle non-existent tab gracefully', async () => {
    const readResult = await execCommand(
      'npm run dev -- sheet read-sheet -n "NonExistentTab123"',
      undefined,
      15000,
      testHomeDir
    );

    expect(readResult.exitCode !== 0 || readResult.stderr.length > 0 || readResult.stdout.includes('not found')).toBe(
      true
    );
  }, 30000);
});
