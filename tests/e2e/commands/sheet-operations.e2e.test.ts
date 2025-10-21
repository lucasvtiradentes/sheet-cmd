import { beforeEach, describe, expect, it } from 'vitest';
import { loadGlobalFixtures } from '../global-fixtures';
import { execCommand } from '../test-utils';

describe('Sheet Operations E2E', () => {
  let testHomeDir: string;
  const uniqueTabName = `Test-Tab-${Date.now()}`;

  beforeEach(async () => {
    const fixtures = loadGlobalFixtures();

    if (!fixtures) {
      throw new Error('Global fixtures not available. E2E tests require global setup.');
    }

    testHomeDir = fixtures.testHomeDir;
  });

  it('should add a new tab', async () => {
    const addResult = await execCommand(
      `npm run dev -- sheet add-sheet -n "${uniqueTabName}"`,
      undefined,
      15000,
      testHomeDir
    );

    expect(addResult.exitCode).toBe(0);
    expect(addResult.stdout.toLowerCase()).toMatch(/created|success/);
  }, 30000);

  it('should list tabs including the newly created one', async () => {
    const listResult = await execCommand('npm run dev -- sheet list-sheets', undefined, 15000, testHomeDir);

    expect(listResult.exitCode).toBe(0);
    expect(listResult.stdout).toContain(uniqueTabName);
  }, 30000);

  it('should rename a tab', async () => {
    const renamedTabName = `${uniqueTabName}-Renamed`;
    const renameResult = await execCommand(
      `npm run dev -- sheet rename-sheet -n "${uniqueTabName}" --new-name "${renamedTabName}"`,
      undefined,
      15000,
      testHomeDir
    );

    expect(renameResult.exitCode).toBe(0);
    expect(renameResult.stdout.toLowerCase()).toMatch(/renamed|success/);

    await new Promise((resolve) => setTimeout(resolve, 1000));

    const listResult = await execCommand('npm run dev -- sheet list-sheets', undefined, 15000, testHomeDir);
    expect(listResult.stdout).toContain(renamedTabName);
  }, 45000);

  it('should copy a tab', async () => {
    const renamedTabName = `${uniqueTabName}-Renamed`;
    const copiedTabName = `${uniqueTabName}-Copy`;

    const copyResult = await execCommand(
      `npm run dev -- sheet copy-sheet -n "${renamedTabName}" --to "${copiedTabName}"`,
      undefined,
      15000,
      testHomeDir
    );

    expect(copyResult.exitCode).toBe(0);
    expect(copyResult.stdout.toLowerCase()).toMatch(/copied|success/);

    const listResult = await execCommand('npm run dev -- sheet list-sheets', undefined, 15000, testHomeDir);
    expect(listResult.stdout).toContain(copiedTabName);
  }, 45000);

  it('should remove tabs', async () => {
    const renamedTabName = `${uniqueTabName}-Renamed`;
    const copiedTabName = `${uniqueTabName}-Copy`;

    const removeResult1 = await execCommand(
      `npm run dev -- sheet remove-sheet -n "${renamedTabName}"`,
      undefined,
      15000,
      testHomeDir
    );
    expect(removeResult1.exitCode).toBe(0);

    const removeResult2 = await execCommand(
      `npm run dev -- sheet remove-sheet -n "${copiedTabName}"`,
      undefined,
      15000,
      testHomeDir
    );
    expect(removeResult2.exitCode).toBe(0);

    const listResult = await execCommand('npm run dev -- sheet list-sheets', undefined, 15000, testHomeDir);
    expect(listResult.stdout).not.toContain(renamedTabName);
    expect(listResult.stdout).not.toContain(copiedTabName);
  }, 60000);

  it('should handle non-existent tab operations gracefully', async () => {
    const nonExistentTab = 'NonExistentTab123456';

    const renameResult = await execCommand(
      `npm run dev -- sheet rename-sheet -n "${nonExistentTab}" --new-name "NewName"`,
      undefined,
      15000,
      testHomeDir
    );

    expect(renameResult.exitCode !== 0 || renameResult.stderr.length > 0).toBe(true);
  }, 30000);
});
