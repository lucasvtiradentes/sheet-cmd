import { accessSync, constants, existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { homedir } from 'node:os';
import { join } from 'node:path';
import chalk from 'chalk';
import { Command } from 'commander';

import { ConfigManager } from '../config/config-manager.js';
import { createCommandFromSchema, createSubCommandFromSchema } from '../definitions/command-builder.js';
import { generateBashCompletion, generateZshCompletion } from '../definitions/generators/completion-generator.js';
import { CommandNames, SubCommandNames } from '../definitions/types.js';
import { Logger } from '../utils/logger.js';

const ZSH_COMPLETION_SCRIPT = generateZshCompletion();

const BASH_COMPLETION_SCRIPT = generateBashCompletion();

function createInstallCommand(): Command {
  const installCompletionCommand = async () => {
    const shell = detectShell();

    switch (shell) {
      case 'zsh':
        await installZshCompletion();
        break;
      case 'bash':
        await installBashCompletion();
        break;
      default:
        Logger.error(`Unsupported shell: ${shell}`);
        Logger.info('');
        Logger.info('🐚 Supported shells: zsh, bash');
        Logger.info('💡 Please switch to a supported shell to use autocompletion');
        process.exit(1);
    }

    const configManager = new ConfigManager();
    configManager.markCompletionInstalled();
  };

  return createSubCommandFromSchema(
    CommandNames.COMPLETION,
    SubCommandNames.COMPLETION_INSTALL,
    installCompletionCommand,
    'Failed to install completion'
  );
}

export function createCompletionCommand(): Command {
  const completion = createCommandFromSchema(CommandNames.COMPLETION);
  completion.addCommand(createInstallCommand());
  return completion;
}

function detectShell(): string {
  const shell = process.env.SHELL || '';

  if (shell.includes('zsh')) {
    return 'zsh';
  } else if (shell.includes('bash')) {
    return 'bash';
  }

  return 'zsh';
}

async function installZshCompletion(): Promise<void> {
  const homeDir = homedir();

  const possibleDirs = [
    join(homeDir, '.oh-my-zsh', 'completions'),
    join(homeDir, '.zsh', 'completions'),
    join(homeDir, '.config', 'zsh', 'completions'),
    join(homeDir, '.local', 'share', 'zsh', 'site-functions'),
    '/usr/local/share/zsh/site-functions'
  ];

  let targetDir: string | null = null;

  for (const dir of possibleDirs) {
    if (existsSync(dir)) {
      try {
        accessSync(dir, constants.W_OK);
        targetDir = dir;
        break;
      } catch {}
    }
  }

  if (!targetDir) {
    targetDir = join(homeDir, '.zsh', 'completions');
    mkdirSync(targetDir, { recursive: true });
  }

  const completionFile = join(targetDir, '_sheet-cmd');
  writeFileSync(completionFile, ZSH_COMPLETION_SCRIPT);

  Logger.success(`Zsh completion installed to ${completionFile}`);
  Logger.info('');
  Logger.info('To activate completion, add this to your ~/.zshrc:');
  Logger.info(chalk.cyan(`  fpath=(${targetDir} $fpath)`));
  Logger.info(chalk.cyan('  autoload -U compinit && compinit'));
  Logger.info('');
  Logger.info('Then restart your shell or run:');
  Logger.info(chalk.cyan('  source ~/.zshrc'));

  try {
    const zshrc = join(homeDir, '.zshrc');
    if (existsSync(zshrc)) {
      const fs = await import('fs');
      const zshrcContent = fs.readFileSync(zshrc, 'utf8');
      if (!zshrcContent.includes(targetDir)) {
        Logger.info('');
        Logger.warning('Remember to add the fpath line to your ~/.zshrc for autocompletion to work!');
      }
    }
  } catch (_error) {}
}

async function installBashCompletion(): Promise<void> {
  const homeDir = homedir();

  const possibleDirs = [
    join(homeDir, '.bash_completion.d'),
    join(homeDir, '.local', 'share', 'bash-completion', 'completions'),
    '/usr/local/etc/bash_completion.d',
    '/etc/bash_completion.d'
  ];

  let targetDir: string | null = null;

  for (const dir of possibleDirs) {
    if (existsSync(dir)) {
      try {
        accessSync(dir, constants.W_OK);
        targetDir = dir;
        break;
      } catch {}
    }
  }

  if (!targetDir) {
    targetDir = join(homeDir, '.bash_completion.d');
    mkdirSync(targetDir, { recursive: true });
  }

  const completionFile = join(targetDir, 'sheet-cmd');
  writeFileSync(completionFile, BASH_COMPLETION_SCRIPT);

  Logger.success(`Bash completion installed to ${completionFile}`);
  Logger.info('');
  Logger.info('To activate completion, add this to your ~/.bashrc:');
  Logger.info(chalk.cyan(`  source ${completionFile}`));
  Logger.info('');
  Logger.info('Then restart your shell or run:');
  Logger.info(chalk.cyan('  source ~/.bashrc'));
}

export async function reinstallCompletionSilently(): Promise<boolean> {
  const configManager = new ConfigManager();

  if (!configManager.isCompletionInstalled()) {
    return false;
  }

  const shell = detectShell();

  try {
    switch (shell) {
      case 'zsh':
        await installZshCompletionSilent();
        await clearZshCompletionCache();
        return true;
      case 'bash':
        await installBashCompletionSilent();
        return true;
      default:
        return false;
    }
  } catch {
    return false;
  }
}

async function installZshCompletionSilent(): Promise<void> {
  const homeDir = homedir();

  const possibleDirs = [
    join(homeDir, '.oh-my-zsh', 'completions'),
    join(homeDir, '.zsh', 'completions'),
    join(homeDir, '.config', 'zsh', 'completions'),
    join(homeDir, '.local', 'share', 'zsh', 'site-functions'),
    '/usr/local/share/zsh/site-functions'
  ];

  let targetDir: string | null = null;

  for (const dir of possibleDirs) {
    if (existsSync(dir)) {
      try {
        accessSync(dir, constants.W_OK);
        targetDir = dir;
        break;
      } catch {}
    }
  }

  if (!targetDir) {
    targetDir = join(homeDir, '.zsh', 'completions');
    mkdirSync(targetDir, { recursive: true });
  }

  const completionFile = join(targetDir, '_sheet-cmd');
  writeFileSync(completionFile, ZSH_COMPLETION_SCRIPT);
}

async function installBashCompletionSilent(): Promise<void> {
  const homeDir = homedir();

  const possibleDirs = [
    join(homeDir, '.bash_completion.d'),
    join(homeDir, '.local', 'share', 'bash-completion', 'completions'),
    '/usr/local/etc/bash_completion.d',
    '/etc/bash_completion.d'
  ];

  let targetDir: string | null = null;

  for (const dir of possibleDirs) {
    if (existsSync(dir)) {
      try {
        accessSync(dir, constants.W_OK);
        targetDir = dir;
        break;
      } catch {}
    }
  }

  if (!targetDir) {
    targetDir = join(homeDir, '.bash_completion.d');
    mkdirSync(targetDir, { recursive: true });
  }

  const completionFile = join(targetDir, 'sheet-cmd');
  writeFileSync(completionFile, BASH_COMPLETION_SCRIPT);
}

async function clearZshCompletionCache(): Promise<void> {
  const homeDir = homedir();
  const zshCacheFile = join(homeDir, '.zcompdump');

  try {
    if (existsSync(zshCacheFile)) {
      const fs = await import('fs');
      fs.unlinkSync(zshCacheFile);
    }
  } catch {}
}
