import { existsSync, mkdirSync, rmSync, writeFileSync } from 'fs';
import { join } from 'path';
import { beforeAll, afterAll, describe, expect, it } from 'vitest';

import { readJson, writeJson } from '../../../src/utils/json-utils';

const TEST_DIR = join(__dirname, '__test-json-utils__');

describe('json-utils', () => {
  beforeAll(() => {
    if (!existsSync(TEST_DIR)) {
      mkdirSync(TEST_DIR, { recursive: true });
    }
  });

  afterAll(() => {
    if (existsSync(TEST_DIR)) {
      rmSync(TEST_DIR, { recursive: true, force: true });
    }
  });

  describe('readJson', () => {
    it('should read and parse JSON file', () => {
      const testFile = join(TEST_DIR, 'test-read.json');
      const testData = { name: 'test', value: 123 };
      writeFileSync(testFile, JSON.stringify(testData));

      const result = readJson(testFile);

      expect(result).toEqual(testData);
    });

    it('should throw error when file does not exist', () => {
      const nonExistentFile = join(TEST_DIR, 'non-existent.json');

      expect(() => readJson(nonExistentFile)).toThrow('File not found');
    });

    it('should throw error when JSON is invalid', () => {
      const testFile = join(TEST_DIR, 'invalid.json');
      writeFileSync(testFile, '{ invalid json }');

      expect(() => readJson(testFile)).toThrow('Failed to parse JSON file');
    });
  });

  describe('writeJson', () => {
    it('should write JSON file with pretty formatting', () => {
      const testFile = join(TEST_DIR, 'test-write.json');
      const testData = { name: 'test', value: 456 };

      writeJson(testFile, testData);

      const result = readJson(testFile);
      expect(result).toEqual(testData);
    });

    it('should write JSON file without formatting when pretty is false', () => {
      const testFile = join(TEST_DIR, 'test-write-compact.json');
      const testData = { name: 'test', value: 789 };

      writeJson(testFile, testData, false);

      const result = readJson(testFile);
      expect(result).toEqual(testData);
    });
  });
});
