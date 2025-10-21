import { Command } from 'commander';
import { ConfigManager } from '../../config/config-manager.js';
import { Logger } from '../../utils/logger.js';

export function createSwitchAccountCommand(): Command {
  const command = new Command('switch');

  command
    .description('Switch active Google account')
    .argument('<email>', 'Account email to switch to')
    .action((email: string) => {
      try {
        const configManager = new ConfigManager();
        configManager.setActiveAccount(email);
        Logger.success(`Switched to account: ${email}`);
      } catch (error) {
        Logger.error(`Failed to switch account: ${error instanceof Error ? error.message : 'Unknown error'}`);
        process.exit(1);
      }
    });

  return command;
}
