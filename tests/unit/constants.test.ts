import { describe, expect, it } from 'vitest';

import { APP_INFO, getUserOS, getConfigDirectory } from '../../src/constants';

describe('constants', () => {
  describe('APP_INFO', () => {
    it('should have correct app name', () => {
      expect(APP_INFO.name).toBe('sheet-cmd');
    });

    it('should have display name', () => {
      expect(APP_INFO.display_name).toBe('Google Sheets CLI');
    });

    it('should have version', () => {
      expect(APP_INFO.version).toBeDefined();
      expect(typeof APP_INFO.version).toBe('string');
    });
  });

  describe('getUserOS', () => {
    it('should return a supported OS', () => {
      const os = getUserOS();

      expect(['linux', 'mac', 'windows', 'wsl']).toContain(os);
    });
  });

  describe('getConfigDirectory', () => {
    it('should return a valid path', () => {
      const configDir = getConfigDirectory();

      expect(configDir).toBeDefined();
      expect(typeof configDir).toBe('string');
      expect(configDir.length).toBeGreaterThan(0);
    });

    it('should include app name in path', () => {
      const configDir = getConfigDirectory();

      expect(configDir).toContain('sheet-cmd');
    });
  });
});
