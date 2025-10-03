import { existsSync, mkdirSync, rmSync } from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';
import { beforeEach, afterEach, describe, expect, it, vi } from 'vitest';

// Mock the CONFIG_PATHS to use test directory
vi.mock('../../../src/constants', () => {
  const testDir = join(tmpdir(), 'sheet-cmd-test', Date.now().toString());
  return {
    APP_INFO: {
      name: 'sheet-cmd-test',
      display_name: 'Sheet CMD Test',
      version: '1.0.0'
    },
    CONFIG_PATHS: {
      configDir: testDir,
      userMetadataFile: join(testDir, 'user_metadata.json'),
      defaultConfigFile: join(testDir, 'config.json')
    },
    getUserOS: () => 'linux',
    getConfigDirectory: () => testDir
  };
});

import { ConfigManager } from '../../../src/lib/config-manager';
import { CONFIG_PATHS } from '../../../src/constants';

const TEST_CONFIG_DIR = CONFIG_PATHS.configDir;

describe('ConfigManager', () => {
  let configManager: ConfigManager;

  beforeEach(() => {
    // Clean up test directory before each test
    if (existsSync(TEST_CONFIG_DIR)) {
      rmSync(TEST_CONFIG_DIR, { recursive: true, force: true });
    }
    mkdirSync(TEST_CONFIG_DIR, { recursive: true });

    configManager = new ConfigManager();
  });

  afterEach(() => {
    // Clean up test directory after each test
    if (existsSync(TEST_CONFIG_DIR)) {
      rmSync(TEST_CONFIG_DIR, { recursive: true, force: true });
    }
  });

  describe('addSpreadsheet', () => {
    it('should add a new spreadsheet configuration', async () => {
      await configManager.addSpreadsheet(
        'test-sheet',
        'test-spreadsheet-id',
        'test@example.com',
        'test-private-key'
      );

      const spreadsheet = configManager.getSpreadsheet('test-sheet');

      expect(spreadsheet).toBeDefined();
      expect(spreadsheet?.name).toBe('test-sheet');
      expect(spreadsheet?.spreadsheet_id).toBe('test-spreadsheet-id');
      expect(spreadsheet?.service_account_email).toBe('test@example.com');
    });

    it('should throw error when adding duplicate spreadsheet', async () => {
      await configManager.addSpreadsheet(
        'test-sheet',
        'test-id',
        'test@example.com',
        'test-key'
      );

      await expect(
        configManager.addSpreadsheet(
          'test-sheet',
          'test-id-2',
          'test2@example.com',
          'test-key-2'
        )
      ).rejects.toThrow("Spreadsheet 'test-sheet' already exists");
    });
  });

  describe('getSpreadsheet', () => {
    it('should return null for non-existent spreadsheet', () => {
      const result = configManager.getSpreadsheet('non-existent');

      expect(result).toBeNull();
    });

    it('should return spreadsheet configuration', async () => {
      await configManager.addSpreadsheet(
        'test-sheet',
        'test-id',
        'test@example.com',
        'test-key'
      );

      const result = configManager.getSpreadsheet('test-sheet');

      expect(result).toBeDefined();
      expect(result?.name).toBe('test-sheet');
    });
  });

  describe('removeSpreadsheet', () => {
    it('should remove an existing spreadsheet', async () => {
      await configManager.addSpreadsheet(
        'test-sheet',
        'test-id',
        'test@example.com',
        'test-key'
      );

      await configManager.removeSpreadsheet('test-sheet');

      const result = configManager.getSpreadsheet('test-sheet');
      expect(result).toBeNull();
    });

    it('should throw error when removing non-existent spreadsheet', async () => {
      await expect(
        configManager.removeSpreadsheet('non-existent')
      ).rejects.toThrow("Spreadsheet 'non-existent' not found");
    });
  });

  describe('listSpreadsheets', () => {
    it('should return empty array when no spreadsheets configured', () => {
      const result = configManager.listSpreadsheets();

      expect(result).toEqual([]);
    });

    it('should list all configured spreadsheets', async () => {
      await configManager.addSpreadsheet('sheet1', 'id1', 'email1@example.com', 'key1');
      await configManager.addSpreadsheet('sheet2', 'id2', 'email2@example.com', 'key2');

      const result = configManager.listSpreadsheets();

      expect(result).toHaveLength(2);
      expect(result[0].name).toBe('sheet1');
      expect(result[1].name).toBe('sheet2');
    });
  });
});
