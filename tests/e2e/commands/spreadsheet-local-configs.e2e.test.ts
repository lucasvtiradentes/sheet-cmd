import { beforeEach, describe, expect, it } from 'vitest';
import { loadGlobalFixtures } from '../global-fixtures';
import { execCommand } from '../test-utils';

describe('Spreadsheet Local Configs E2E', () => {
  let testHomeDir: string;

  beforeEach(async () => {
    const fixtures = loadGlobalFixtures();

    if (!fixtures) {
      throw new Error('Global fixtures not available. E2E tests require global setup.');
    }

    testHomeDir = fixtures.testHomeDir;
  });

  it('should list all configured spreadsheets', async () => {
    const listResult = await execCommand('npm run dev -- spreadsheet list', undefined, 15000, testHomeDir);

    expect(listResult.exitCode).toBe(0);
    expect(listResult.stdout).toContain('Configured spreadsheets');
    expect(listResult.stdout).toContain('e2e-test-spreadsheet');
  }, 30000);

  it('should show active spreadsheet', async () => {
    const activeResult = await execCommand('npm run dev -- spreadsheet active', undefined, 15000, testHomeDir);

    expect(activeResult.exitCode).toBe(0);
    expect(activeResult.stdout).toContain('e2e-test-spreadsheet');
  }, 30000);

  it('should switch between spreadsheets (if multiple exist)', async () => {
    // First check how many spreadsheets exist
    const listResult = await execCommand('npm run dev -- spreadsheet list', undefined, 15000, testHomeDir);

    if (!listResult.stdout.includes('e2e-test-spreadsheet')) {
      console.log('Only one spreadsheet configured, skipping switch test');
      return;
    }

    // Try to switch to the same spreadsheet (should work)
    const switchResult = await execCommand(
      'npm run dev -- spreadsheet switch e2e-test-spreadsheet',
      undefined,
      15000,
      testHomeDir
    );

    expect(switchResult.exitCode).toBe(0);
    expect(switchResult.stdout.toLowerCase()).toMatch(/switched|active/);
  }, 30000);

  it('should handle non-existent spreadsheet gracefully', async () => {
    const switchResult = await execCommand(
      'npm run dev -- spreadsheet switch "NonExistentSpreadsheet123"',
      undefined,
      15000,
      testHomeDir
    );

    expect(switchResult.exitCode !== 0 || switchResult.stderr.length > 0).toBe(true);
  }, 30000);
});
