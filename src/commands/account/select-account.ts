import { Command } from 'commander';
import { ConfigManager } from '../../config/config-manager.js';
import { Logger } from '../../utils/logger.js';

export function createSelectAccountCommand(): Command {
  const command = new Command('select');

  command
    .description('Select active Google account')
    .argument('<email>', 'Account email to select')
    .action((email: string) => {
      try {
        const configManager = new ConfigManager();
        configManager.setActiveAccount(email);
        Logger.success(`Selected account: ${email}`);
      } catch (error) {
        Logger.error(`Failed to select account: ${error instanceof Error ? error.message : 'Unknown error'}`);
        process.exit(1);
      }
    });

  return command;
}
