import fs from 'node:fs';
import path from 'node:path';
import { beforeEach, describe, expect, it } from 'vitest';
import { loadGlobalFixtures } from '../../configs/e2e-global-fixtures';
import { execCommand } from '../../configs/e2e-test-utils';

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
      `sheet write -n "${testTabName}" -c A1 -v "Test Value"`,
      undefined,
      15000,
      testHomeDir
    );

    expect(writeResult.exitCode).toBe(0);
    expect(writeResult.stdout.toLowerCase()).toMatch(/updated|success/);
  }, 30000);

  it('should infer numeric single cell values by default', async () => {
    const writeResult = await execCommand(
      `sheet write -n "${testTabName}" -c I10 -v "1"`,
      undefined,
      15000,
      testHomeDir
    );

    expect(writeResult.exitCode).toBe(0);

    await execCommand(`sheet write -n "${testTabName}" -c I11 -v "=ISNUMBER(I10)"`, undefined, 15000, testHomeDir);

    const readResult = await execCommand(
      `sheet read -n "${testTabName}" -r I11:I11 -o csv`,
      undefined,
      15000,
      testHomeDir
    );

    expect(readResult.stdout).toContain('TRUE');
  }, 60000);

  it('should infer decimal numeric strings with trailing zeros', async () => {
    const writeResult = await execCommand(
      `sheet write -n "${testTabName}" -c M10 -v "100.000"`,
      undefined,
      15000,
      testHomeDir
    );

    expect(writeResult.exitCode).toBe(0);

    await execCommand(`sheet write -n "${testTabName}" -c M11 -v "=ISNUMBER(M10)"`, undefined, 15000, testHomeDir);

    const readResult = await execCommand(
      `sheet read -n "${testTabName}" -r M11:M11 -o csv`,
      undefined,
      15000,
      testHomeDir
    );

    expect(readResult.stdout).toContain('TRUE');
  }, 60000);

  it('should keep leading-zero numeric strings as text', async () => {
    const writeResult = await execCommand(
      `sheet write -n "${testTabName}" -c N10 -v "001"`,
      undefined,
      15000,
      testHomeDir
    );

    expect(writeResult.exitCode).toBe(0);

    await execCommand(`sheet write -n "${testTabName}" -c N11 -v "=ISTEXT(N10)"`, undefined, 15000, testHomeDir);

    const readResult = await execCommand(
      `sheet read -n "${testTabName}" -r N11:N11 -o csv`,
      undefined,
      15000,
      testHomeDir
    );

    expect(readResult.stdout).toContain('TRUE');
  }, 60000);

  it('should keep single cell values as text when type inference is disabled', async () => {
    const writeResult = await execCommand(
      `sheet write -n "${testTabName}" -c J10 -v "1" --no-infer-types`,
      undefined,
      15000,
      testHomeDir
    );

    expect(writeResult.exitCode).toBe(0);

    await execCommand(`sheet write -n "${testTabName}" -c J11 -v "=ISTEXT(J10)"`, undefined, 15000, testHomeDir);

    const readResult = await execCommand(
      `sheet read -n "${testTabName}" -r J11:J11 -o csv`,
      undefined,
      15000,
      testHomeDir
    );

    expect(readResult.stdout).toContain('TRUE');
  }, 60000);

  it('should write to a range of cells', async () => {
    const writeResult = await execCommand(
      `sheet write -n "${testTabName}" -r A1:D5 -v "Product,Price,Quantity,Total;Laptop,999.99,2,1999.98;Mouse,29.99,5,149.95;Keyboard,79.99,3,239.97;Monitor,299.99,1,299.99"`,
      undefined,
      15000,
      testHomeDir
    );

    expect(writeResult.exitCode).toBe(0);
    expect(writeResult.stdout.toLowerCase()).toMatch(/updated|success/);
  }, 30000);

  it('should write JSON table values starting at a cell', async () => {
    const valueFile = path.join(testHomeDir, 'cell-start-table.json');
    fs.writeFileSync(
      valueFile,
      JSON.stringify([
        ['Header A', 'Header B'],
        ['Value A', 'Value B']
      ])
    );

    const writeResult = await execCommand(
      `sheet write -n "${testTabName}" --initial-cell C10 --value-file "${valueFile}"`,
      undefined,
      15000,
      testHomeDir
    );

    expect(writeResult.exitCode).toBe(0);
    expect(writeResult.stdout).toContain('C10:D11');
  }, 30000);

  it('should write delimited table values starting at a cell', async () => {
    const writeResult = await execCommand(
      `sheet write -n "${testTabName}" --initial-cell K10 -v "Header A,Header B;1,001"`,
      undefined,
      15000,
      testHomeDir
    );

    expect(writeResult.exitCode).toBe(0);
    expect(writeResult.stdout).toContain('K10:L11');

    await execCommand(`sheet write -n "${testTabName}" -c K12 -v "=ISNUMBER(K11)"`, undefined, 15000, testHomeDir);
    await execCommand(`sheet write -n "${testTabName}" -c L12 -v "=ISTEXT(L11)"`, undefined, 15000, testHomeDir);

    const readResult = await execCommand(
      `sheet read -n "${testTabName}" -r K12:L12 -o csv`,
      undefined,
      15000,
      testHomeDir
    );

    expect(readResult.stdout).toContain('TRUE,TRUE');
  }, 60000);

  it('should infer numeric JSON string values by default', async () => {
    const valueFile = path.join(testHomeDir, 'infer-types-table.json');
    fs.writeFileSync(valueFile, JSON.stringify([['1', '001']]));

    const writeResult = await execCommand(
      `sheet write -n "${testTabName}" --initial-cell E10 --value-file "${valueFile}"`,
      undefined,
      15000,
      testHomeDir
    );

    expect(writeResult.exitCode).toBe(0);

    await execCommand(`sheet write -n "${testTabName}" -c E11 -v "=ISNUMBER(E10)"`, undefined, 15000, testHomeDir);
    await execCommand(`sheet write -n "${testTabName}" -c F11 -v "=ISTEXT(F10)"`, undefined, 15000, testHomeDir);

    const readResult = await execCommand(
      `sheet read -n "${testTabName}" -r E11:F11 -o csv`,
      undefined,
      15000,
      testHomeDir
    );

    expect(readResult.stdout).toContain('TRUE,TRUE');
  }, 60000);

  it('should keep JSON string values as text when type inference is disabled', async () => {
    const valueFile = path.join(testHomeDir, 'no-infer-types-table.json');
    fs.writeFileSync(valueFile, JSON.stringify([['1']]));

    const writeResult = await execCommand(
      `sheet write -n "${testTabName}" --initial-cell G10 --value-file "${valueFile}" --no-infer-types`,
      undefined,
      15000,
      testHomeDir
    );

    expect(writeResult.exitCode).toBe(0);

    await execCommand(`sheet write -n "${testTabName}" -c G11 -v "=ISTEXT(G10)"`, undefined, 15000, testHomeDir);

    const readResult = await execCommand(
      `sheet read -n "${testTabName}" -r G11:G11 -o csv`,
      undefined,
      15000,
      testHomeDir
    );

    expect(readResult.stdout).toContain('TRUE');
  }, 60000);

  it('should keep delimited values as text when type inference is disabled', async () => {
    const writeResult = await execCommand(
      `sheet write -n "${testTabName}" -r H10:H10 -v "1" --no-infer-types`,
      undefined,
      15000,
      testHomeDir
    );

    expect(writeResult.exitCode).toBe(0);

    await execCommand(`sheet write -n "${testTabName}" -c H11 -v "=ISTEXT(H10)"`, undefined, 15000, testHomeDir);

    const readResult = await execCommand(
      `sheet read -n "${testTabName}" -r H11:H11 -o csv`,
      undefined,
      15000,
      testHomeDir
    );

    expect(readResult.stdout).toContain('TRUE');
  }, 60000);

  it('should handle dimension mismatch error', async () => {
    const writeResult = await execCommand(
      `sheet write -n "${testTabName}" -r A1:C3 -v "value1,value2"`,
      undefined,
      15000,
      testHomeDir
    );

    expect(writeResult.exitCode !== 0 || writeResult.stderr.length > 0 || writeResult.stdout.includes('mismatch')).toBe(
      true
    );
  }, 30000);

  it('should append multiple rows', async () => {
    const appendResult1 = await execCommand(
      `sheet append -n "${testTabName}" -v "Scanner,149.99,2,299.98"`,
      undefined,
      15000,
      testHomeDir
    );
    expect(appendResult1.exitCode).toBe(0);

    const appendResult2 = await execCommand(
      `sheet append -n "${testTabName}" -v "Webcam,89.99,4,359.96"`,
      undefined,
      15000,
      testHomeDir
    );
    expect(appendResult2.exitCode).toBe(0);

    const appendResult3 = await execCommand(
      `sheet append -n "${testTabName}" -v "Headset,59.99,3,179.97"`,
      undefined,
      15000,
      testHomeDir
    );
    expect(appendResult3.exitCode).toBe(0);
    expect(appendResult3.stdout.toLowerCase()).toMatch(/appended|success/);
  }, 60000);

  it('should infer appended values by default and allow disabling type inference', async () => {
    const appendTabName = `Append-Infer-${Date.now()}`;
    await execCommand(`sheet add -n "${appendTabName}"`, undefined, 15000, testHomeDir);

    const appendResult1 = await execCommand(
      `sheet append -n "${appendTabName}" -v "1,001"`,
      undefined,
      15000,
      testHomeDir
    );
    expect(appendResult1.exitCode).toBe(0);

    await execCommand(`sheet write -n "${appendTabName}" -c A2 -v "=ISNUMBER(A1)"`, undefined, 15000, testHomeDir);
    await execCommand(`sheet write -n "${appendTabName}" -c B2 -v "=ISTEXT(B1)"`, undefined, 15000, testHomeDir);

    const inferredReadResult = await execCommand(
      `sheet read -n "${appendTabName}" -r A2:B2 -o csv`,
      undefined,
      15000,
      testHomeDir
    );
    expect(inferredReadResult.stdout).toContain('TRUE,TRUE');

    const appendResult2 = await execCommand(
      `sheet append -n "${appendTabName}" -v "1" --no-infer-types`,
      undefined,
      15000,
      testHomeDir
    );
    expect(appendResult2.exitCode).toBe(0);

    await execCommand(`sheet write -n "${appendTabName}" -c A4 -v "=ISTEXT(A3)"`, undefined, 15000, testHomeDir);

    const textReadResult = await execCommand(
      `sheet read -n "${appendTabName}" -r A4:A4 -o csv`,
      undefined,
      15000,
      testHomeDir
    );
    expect(textReadResult.stdout).toContain('TRUE');

    await execCommand(`sheet remove -n "${appendTabName}"`, undefined, 15000, testHomeDir);
  }, 90000);

  it('should read sheet content in different formats', async () => {
    const markdownResult = await execCommand(
      `sheet read -n "${testTabName}" -o markdown`,
      undefined,
      15000,
      testHomeDir
    );
    expect(markdownResult.exitCode).toBe(0);
    expect(markdownResult.stdout).toContain('Content of sheet');

    const csvResult = await execCommand(`sheet read -n "${testTabName}" -o csv`, undefined, 15000, testHomeDir);
    expect(csvResult.exitCode).toBe(0);
  }, 60000);

  it('should handle write operations with missing flags', async () => {
    const writeResult = await execCommand(`sheet write -n "${testTabName}" -v "value"`, undefined, 15000, testHomeDir);

    expect(writeResult.exitCode !== 0 || writeResult.stderr.length > 0).toBe(true);
  }, 30000);
});
