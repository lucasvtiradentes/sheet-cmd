import { ConfigManager } from '../config/config-manager.js';

let configManagerInstance: ConfigManager | null = null;

export function getConfigManager(): ConfigManager {
  if (!configManagerInstance) {
    configManagerInstance = new ConfigManager();
  }
  return configManagerInstance;
}

export function resetConfigManager(): void {
  configManagerInstance = null;
}
