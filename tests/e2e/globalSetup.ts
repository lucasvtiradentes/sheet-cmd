import './load-env';

import fs from 'fs';
import os from 'os';
import path from 'path';
import { clearGlobalFixtures, loadGlobalFixtures, saveGlobalFixtures } from './global-fixtures';
import { execCommand } from './test-utils';

export async function setup() {
  const spreadsheetId = process.env.SPREADSHEET_ID_E2E;
  const serviceAccountEmail = process.env.SERVICE_ACCOUNT_EMAIL_E2E;
  const privateKey = process.env.PRIVATE_KEY_E2E;

  if (!spreadsheetId || !serviceAccountEmail || !privateKey) {
    console.log('⚠️  Skipping global fixtures creation: Missing environment variables\n');
    return;
  }

  console.log('🌍 Creating global fixtures for all E2E tests...');

  const testHomeDir = path.join(os.tmpdir(), `gsheet-global-e2e-${Date.now()}`);
  const testConfigDir = path.join(testHomeDir, '.config', 'gsheet');

  try {
    fs.mkdirSync(testConfigDir, { recursive: true });

    const userMetadataPath = path.join(testConfigDir, 'user_metadata.json');
    const configPath = path.join(testConfigDir, 'config.json');

    const spreadsheetName = 'e2e-test-spreadsheet';

    fs.writeFileSync(
      userMetadataPath,
      JSON.stringify({
        config_path: configPath,
        active_spreadsheet: spreadsheetName
      })
    );

    fs.writeFileSync(
      configPath,
      JSON.stringify(
        {
          spreadsheets: {
            [spreadsheetName]: {
              name: spreadsheetName,
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

    console.log('  ✓ Created test configuration');

    const testTabName = `E2E-Test-Sheet-${Date.now()}`;
    const addSheetResult = await execCommand(
      `npm run dev -- sheet add-sheet -n "${testTabName}"`,
      undefined,
      15000,
      testHomeDir
    );

    if (addSheetResult.exitCode !== 0) {
      throw new Error(`Failed to create test sheet: ${addSheetResult.stderr}`);
    }

    console.log('  ✓ Created test sheet');

    const writeDataResult = await execCommand(
      `npm run dev -- sheet write-cell -n "${testTabName}" -r A1:C3 -v "Name,Age,City;John,30,NYC;Jane,25,LA"`,
      undefined,
      15000,
      testHomeDir
    );

    if (writeDataResult.exitCode !== 0) {
      console.log('  ⚠️  Warning: Failed to add test data (non-critical)');
      console.log(`     Error: ${writeDataResult.stderr || writeDataResult.stdout}`);
    } else {
      console.log('  ✓ Added test data to sheet');
    }

    saveGlobalFixtures({
      testTabName,
      spreadsheetName,
      testHomeDir
    });

    console.log('✅ Global fixtures created successfully\n');
  } catch (error) {
    console.error('❌ Failed to create global fixtures:', error);
    if (fs.existsSync(testHomeDir)) {
      fs.rmSync(testHomeDir, { recursive: true, force: true });
    }
    clearGlobalFixtures();
    console.log('⚠️  Tests will run without global fixtures (slower)\n');
  }
}

export async function teardown() {
  console.log('\n🧹 Cleaning up global fixtures...');

  const spreadsheetId = process.env.SPREADSHEET_ID_E2E;
  const serviceAccountEmail = process.env.SERVICE_ACCOUNT_EMAIL_E2E;
  const privateKey = process.env.PRIVATE_KEY_E2E;

  if (!spreadsheetId || !serviceAccountEmail || !privateKey) {
    console.log('⚠️  Skipping cleanup: Missing environment variables');
    return;
  }

  try {
    const fixtures = loadGlobalFixtures();

    if (!fixtures) {
      console.log('⚠️  No global fixtures to clean up');
      return;
    }

    const { testTabName, testHomeDir } = fixtures;

    if (testTabName) {
      const deleteResult = await execCommand(
        `npm run dev -- sheet remove-sheet -n "${testTabName}"`,
        undefined,
        15000,
        testHomeDir
      );

      if (deleteResult.exitCode === 0) {
        console.log('  ✓ Deleted test sheet');
      } else {
        console.log('  ⚠️  Could not delete test sheet (may not exist)');
      }
    }

    if (fs.existsSync(testHomeDir)) {
      fs.rmSync(testHomeDir, { recursive: true, force: true });
      console.log('  ✓ Cleaned up test directory');
    }

    clearGlobalFixtures();

    console.log('✅ Global fixtures cleaned up successfully\n');
  } catch (error) {
    console.error('❌ Failed to clean up global fixtures:', error);
    console.error('You may need to manually delete the test sheet from Google Sheets');
  }

  console.log('🧹 E2E tests completed\n');
}
