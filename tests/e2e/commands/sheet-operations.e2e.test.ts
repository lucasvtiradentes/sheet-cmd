import { spawn } from 'child_process';
import fs from 'fs';
import os from 'os';
import path from 'path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

interface CommandResult {
  stdout: string;
  stderr: string;
  exitCode: number;
}

async function execCommand(command: string, input?: string, timeout = 30000, homeDir?: string): Promise<CommandResult> {
  return new Promise((resolve, reject) => {
    const [cmd, ...args] = command.split(' ');
    const child = spawn(cmd, args, {
      cwd: path.resolve(__dirname, '../../..'),
      env: {
        ...process.env,
        NODE_ENV: 'test',
        ...(homeDir ? { HOME: homeDir } : {}),
        CI: 'true',
        FORCE_TTY: 'false',
        FORCE_STDIN: 'true'
      },
      stdio: ['pipe', 'pipe', 'pipe']
    });

    let stdout = '';
    let stderr = '';
    let isResolved = false;

    const timeoutId = setTimeout(() => {
      if (!isResolved) {
        child.kill('SIGTERM');
        reject(new Error(`Command timed out after ${timeout}ms`));
      }
    }, timeout);

    if (input && child.stdin) {
      const lines = input.split('\n');
      let index = 0;

      const writeNext = () => {
        if (index < lines.length && child.stdin && !child.stdin.destroyed) {
          child.stdin.write(`${lines[index]}\n`);
          index++;
          if (index < lines.length) {
            setTimeout(writeNext, 500);
          }
        }
      };

      setTimeout(writeNext, 1000);
    }

    child.stdout?.on('data', (data) => {
      stdout += data.toString();
    });

    child.stderr?.on('data', (data) => {
      stderr += data.toString();
    });

    child.on('close', (code) => {
      if (!isResolved) {
        isResolved = true;
        clearTimeout(timeoutId);
        resolve({
          stdout,
          stderr,
          exitCode: code || 0
        });
      }
    });

    child.on('error', (error) => {
      if (!isResolved) {
        isResolved = true;
        clearTimeout(timeoutId);
        reject(error);
      }
    });
  });
}

describe('Sheet Operations E2E', () => {
  const testHomeDir = path.join(os.tmpdir(), `sheet-cmd-e2e-${Date.now()}`);
  const testConfigDir = path.join(testHomeDir, '.config', 'sheet-cmd');

  beforeEach(async () => {
    if (fs.existsSync(testHomeDir)) {
      fs.rmSync(testHomeDir, { recursive: true, force: true });
    }

    fs.mkdirSync(testConfigDir, { recursive: true });

    const userMetadataPath = path.join(testConfigDir, 'user_metadata.json');
    const configPath = path.join(testConfigDir, 'config.json');

    const spreadsheetId = process.env.SPREADSHEET_ID_E2E;
    const serviceAccountEmail = process.env.SERVICE_ACCOUNT_EMAIL_E2E;
    const privateKey = process.env.PRIVATE_KEY_E2E;

    fs.writeFileSync(
      userMetadataPath,
      JSON.stringify({
        config_path: configPath,
        active_spreadsheet: 'test-sheet'
      })
    );

    fs.writeFileSync(
      configPath,
      JSON.stringify(
        {
          spreadsheets: {
            'test-sheet': {
              name: 'test-sheet',
              spreadsheet_id: spreadsheetId,
              service_account_email: serviceAccountEmail,
              private_key: privateKey
            }
          }
        },
        null,
        2
      )
    );
  });

  afterEach(() => {
    if (fs.existsSync(testHomeDir)) {
      fs.rmSync(testHomeDir, { recursive: true, force: true });
    }
  });

  it('should list tabs from the test spreadsheet', async () => {
    const listTabsResult = await execCommand('node dist/cli.js sheet list-tabs', undefined, 15000, testHomeDir);

    expect(listTabsResult.exitCode).toBe(0);
    expect(listTabsResult.stdout).toContain('Tabs');
    expect(listTabsResult.stdout).toContain('sheet-cmd-test');

    // Should list at least one tab
    expect(listTabsResult.stdout.length).toBeGreaterThan(0);
  }, 30000);

  it('should read a sheet tab content', async () => {
    // First list tabs to get a tab name
    const listTabsResult = await execCommand('node dist/cli.js sheet list-tabs', undefined, 15000, testHomeDir);
    expect(listTabsResult.exitCode).toBe(0);

    // Extract first tab name from output (assuming format contains tab names)
    const tabMatch = listTabsResult.stdout.match(/\d+\.\s+(.+)/);
    if (!tabMatch) {
      console.log('No tabs found in spreadsheet, skipping read test');
      return;
    }

    const tabName = tabMatch[1].trim();

    // Read the tab content - using -t flag without quotes in args
    const readResult = await execCommand(
      `node dist/cli.js sheet read-sheet -t ${tabName}`,
      undefined,
      15000,
      testHomeDir
    );

    expect(readResult.exitCode).toBe(0);
    expect(readResult.stdout).toContain('Content of sheet');
  }, 45000);

  it('should handle non-existent tab gracefully', async () => {
    const readResult = await execCommand(
      'node dist/cli.js sheet read-sheet -t "NonExistentTab123"',
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
