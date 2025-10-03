import { describe, expect, it } from 'vitest';

import {
  userMetadataSchema,
  spreadsheetCredentialsSchema,
  sheetsConfigSchema,
  sheetDataSchema
} from '../../../src/types/local';

describe('local types schemas', () => {
  describe('userMetadataSchema', () => {
    it('should validate correct user metadata', () => {
      const validData = {
        config_path: '/path/to/config.json'
      };

      const result = userMetadataSchema.parse(validData);

      expect(result.config_path).toBe('/path/to/config.json');
    });

    it('should validate with optional active_spreadsheet', () => {
      const validData = {
        config_path: '/path/to/config.json',
        active_spreadsheet: 'my-sheet'
      };

      const result = userMetadataSchema.parse(validData);

      expect(result.active_spreadsheet).toBe('my-sheet');
    });

    it('should throw error when config_path is missing', () => {
      const invalidData = {};

      expect(() => userMetadataSchema.parse(invalidData)).toThrow();
    });
  });

  describe('spreadsheetCredentialsSchema', () => {
    it('should validate correct spreadsheet credentials', () => {
      const validData = {
        name: 'test-sheet',
        spreadsheet_id: '1234567890',
        service_account_email: 'test@example.com',
        private_key: '-----BEGIN PRIVATE KEY-----\ntest\n-----END PRIVATE KEY-----'
      };

      const result = spreadsheetCredentialsSchema.parse(validData);

      expect(result.name).toBe('test-sheet');
      expect(result.spreadsheet_id).toBe('1234567890');
    });

    it('should throw error when required fields are missing', () => {
      const invalidData = {
        name: 'test-sheet'
      };

      expect(() => spreadsheetCredentialsSchema.parse(invalidData)).toThrow();
    });
  });

  describe('sheetsConfigSchema', () => {
    it('should validate correct sheets config', () => {
      const validData = {
        spreadsheets: {
          'my-sheet': {
            name: 'my-sheet',
            spreadsheet_id: '123',
            service_account_email: 'test@example.com',
            private_key: 'key'
          }
        },
        settings: {
          max_results: 100,
          default_columns: 'A:Z'
        }
      };

      const result = sheetsConfigSchema.parse(validData);

      expect(result.spreadsheets['my-sheet'].name).toBe('my-sheet');
      expect(result.settings?.max_results).toBe(100);
    });

    it('should use default values for settings', () => {
      const validData = {
        spreadsheets: {},
        settings: {}
      };

      const result = sheetsConfigSchema.parse(validData);

      expect(result.settings?.max_results).toBe(50);
      expect(result.settings?.default_columns).toBe('A:Z');
    });
  });

  describe('sheetDataSchema', () => {
    it('should validate correct sheet data', () => {
      const validData = {
        title: 'Sheet1',
        index: 0
      };

      const result = sheetDataSchema.parse(validData);

      expect(result.title).toBe('Sheet1');
      expect(result.index).toBe(0);
    });

    it('should throw error when fields are missing', () => {
      const invalidData = {
        title: 'Sheet1'
      };

      expect(() => sheetDataSchema.parse(invalidData)).toThrow();
    });
  });
});
