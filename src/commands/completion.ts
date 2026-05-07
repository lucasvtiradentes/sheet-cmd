import { accessSync, constants, existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { homedir } from 'node:os';
import { join } from 'node:path';
import type { Program as CaporalProgram } from '@caporal/core';
import chalk from 'chalk';

import { ConfigManager } from '../config/config-manager';
import { Logger } from '../utils/logger';
import { getBashCompletionScript } from './completion/bash';
import { getFishCompletionScript } from './completion/fish';
import {
  type CompletionGroup,
  type CompletionOption,
  getCompletionBinNames,
  getOptionGroups,
  getRootCommands,
  getSubcommandGroups,
  isVisibleCompletionCommand
} from './completion/shared';
import { getZshCompletionScript } from './completion/zsh';
import { argument, defineCommand, defineSubCommand } from './define';

enum CompletionShell {
  Bash = 'bash',
  Fish = 'fish',
  Zsh = 'zsh'
}

const completionShells = Object.values(CompletionShell);

export const completionCommand = defineCommand({
  name: 'completion',
  description: 'Generate shell completion scripts',
  arguments: [argument.string('shell', `Shell to generate completion for (${completionShells.join(', ')})`)],
  subcommands: [
    defineSubCommand({
      name: 'install',
      description: 'Install shell completion for your current shell',
      action: async () => {
        await installCompletion();
      }
    })
  ]
});

const completionScriptGenerators = {
  [CompletionShell.Bash]: getBashCompletionScript,
  [CompletionShell.Fish]: getFishCompletionScript,
  [CompletionShell.Zsh]: getZshCompletionScript
} as const satisfies Record<
  CompletionShell,
  (
    binNames: string[],
    roots: CompletionGroup[],
    subcommands: Map<string, CompletionGroup[]>,
    options: Map<string, CompletionOption[]>
  ) => string
>;

let completionProgram: CaporalProgram | undefined;

export function createCompletionCommand(program: CaporalProgram): void {
  completionProgram = program;
  const shellArgument = completionCommand.arguments?.[0];
  const installCommand = completionCommand.subcommands[0];

  if (!shellArgument) {
    throw new Error('Completion shell argument metadata is missing');
  }

  program
    .command(completionCommand.name, completionCommand.description)
    .argument(`[${shellArgument.name}]`, shellArgument.description)
    .strict(false)
    .action(async ({ args, program }) => {
      const shell = args.shell ? String(args.shell) : '';
      if (isCompletionShell(shell)) {
        console.log(await getCompletionScript(program, shell));
        return 0;
      }
      Logger.error(`Unsupported shell: ${shell || '<empty>'}`);
      Logger.info(`Supported: ${completionShells.join(', ')}`);
      return 1;
    });

  program
    .command(`${completionCommand.name} ${installCommand.name}`, installCommand.description)
    .action(async () => installCommand.action({ args: {}, options: {} }));
}

function detectShell(): string {
  const shell = process.env.SHELL || '';

  if (shell.includes('zsh')) {
    return 'zsh';
  } else if (shell.includes('bash')) {
    return 'bash';
  } else if (shell.includes('fish')) {
    return 'fish';
  }

  return 'zsh';
}

async function installCompletion(): Promise<void> {
  const shell = detectShell();

  switch (shell) {
    case 'zsh':
      await installZshCompletion();
      break;
    case 'bash':
      await installBashCompletion();
      break;
    case 'fish':
      await installFishCompletion();
      break;
    default:
      Logger.error(`Unsupported shell: ${shell}`);
      Logger.info('');
      Logger.info('Supported shells: zsh, bash, fish');
      process.exit(1);
  }

  const configManager = new ConfigManager();
  configManager.markCompletionInstalled();
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
  writeFileSync(completionFile, await getCurrentCompletionScript(CompletionShell.Zsh));

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
  writeFileSync(completionFile, await getCurrentCompletionScript(CompletionShell.Bash));

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
      case 'fish':
        await installFishCompletionSilent();
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
  writeFileSync(completionFile, await getCurrentCompletionScript(CompletionShell.Zsh));
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
  writeFileSync(completionFile, await getCurrentCompletionScript(CompletionShell.Bash));
}

async function installFishCompletion(): Promise<void> {
  const homeDir = homedir();
  const targetDir = join(homeDir, '.config', 'fish', 'completions');
  mkdirSync(targetDir, { recursive: true });

  const completionFile = join(targetDir, 'sheet-cmd.fish');
  writeFileSync(completionFile, await getCurrentCompletionScript(CompletionShell.Fish));

  Logger.success(`Fish completion installed to ${completionFile}`);
  Logger.info('');
  Logger.info('Then restart your shell or run:');
  Logger.info(chalk.cyan('  source ~/.config/fish/config.fish'));
}

async function installFishCompletionSilent(): Promise<void> {
  const homeDir = homedir();
  const targetDir = join(homeDir, '.config', 'fish', 'completions');
  mkdirSync(targetDir, { recursive: true });

  const completionFile = join(targetDir, 'sheet-cmd.fish');
  writeFileSync(completionFile, await getCurrentCompletionScript(CompletionShell.Fish));
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

function isCompletionShell(value: string): value is CompletionShell {
  return (completionShells as readonly string[]).includes(value);
}

async function getCurrentCompletionScript(shell: CompletionShell) {
  if (!completionProgram) {
    throw new Error('Completion program not initialized');
  }

  return getCompletionScript(completionProgram, shell);
}

async function getCompletionScript(program: CaporalProgram, shell: CompletionShell) {
  const commands = (await program.getAllCommands()).filter(isVisibleCompletionCommand);
  const roots = getRootCommands(commands);
  const subcommands = getSubcommandGroups(commands);
  subcommands.set(
    completionCommand.name,
    completionShells.map((shell) => ({ name: shell, description: `Generate ${shell} completion` }))
  );
  const options = getOptionGroups(commands);
  return completionScriptGenerators[shell](getCompletionBinNames(program.getBin()), roots, subcommands, options);
}
