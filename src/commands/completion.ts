import { accessSync, constants, existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { homedir } from 'node:os';
import { join } from 'node:path';
import chalk from 'chalk';
import { Command } from 'commander';

import { Logger } from '../lib/logger.js';

const ZSH_COMPLETION_SCRIPT = `#compdef sheet-cmd

_sheet_cmd() {
    local state line context
    typeset -A opt_args

    _arguments -C \
        '1: :_sheet_cmd_commands' \
        '*::arg:->args'

    case $state in
        args)
            case $line[1] in
                spreadsheet)
                    _sheet_cmd_spreadsheet
                    ;;
                sheet)
                    _sheet_cmd_sheet
                    ;;
                update)
                    # No subcommands for update
                    ;;
            esac
            ;;
    esac
}

_sheet_cmd_commands() {
    local commands
    commands=(
        'spreadsheet:Manage spreadsheet configurations'
        'sheet:Manage and interact with Google Sheets'
        'update:Update sheet-cmd to latest version'
        'completion:Generate shell completion scripts'
    )
    _describe 'command' commands
}

_sheet_cmd_spreadsheet() {
    local spreadsheet_commands
    spreadsheet_commands=(
        'add:Add a new spreadsheet configuration'
        'list:List all configured spreadsheets'
        'remove:Remove a spreadsheet configuration'
        'switch:Switch to a different spreadsheet (sets as active)'
        'active:Show the currently active spreadsheet'
    )
    _describe 'spreadsheet command' spreadsheet_commands
}

_sheet_cmd_sheet() {
    local sheet_commands
    sheet_commands=(
        'list-tabs:List all tabs/sheets in a spreadsheet'
        'read-sheet:Read the complete content of a sheet tab'
        'add-tab:Add a new tab/sheet to the spreadsheet'
        'remove-tab:Remove a tab/sheet from the spreadsheet'
    )
    _describe 'sheet command' sheet_commands
}

_sheet_cmd "$@"
`;

const BASH_COMPLETION_SCRIPT = `#!/bin/bash

_sheet_cmd_completion() {
    local cur prev words cword
    _init_completion || return

    # Main commands
    local commands="spreadsheet sheet update completion"

    # Spreadsheet subcommands
    local spreadsheet_commands="add list remove switch active"

    # Sheet subcommands
    local sheet_commands="list-tabs read-sheet add-tab remove-tab"

    if [[ \$cword -eq 1 ]]; then
        COMPREPLY=(\$(compgen -W "\$commands" -- "\$cur"))
    elif [[ \$cword -eq 2 ]]; then
        case "\${COMP_WORDS[1]}" in
            spreadsheet)
                COMPREPLY=(\$(compgen -W "\$spreadsheet_commands" -- "\$cur"))
                ;;
            sheet)
                COMPREPLY=(\$(compgen -W "\$sheet_commands" -- "\$cur"))
                ;;
            completion)
                COMPREPLY=(\$(compgen -W "install" -- "\$cur"))
                ;;
        esac
    fi
}

complete -F _sheet_cmd_completion sheet-cmd
complete -F _sheet_cmd_completion sheet
`;

export function createCompletionCommand(): Command {
  const completion = new Command('completion');
  completion.description('Generate shell completion scripts');

  completion
    .command('install')
    .description('Install shell completion for your current shell')
    .action(async () => {
      const shell = detectShell();

      try {
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
      } catch (error) {
        Logger.error('Failed to install completion', error);
        process.exit(1);
      }
    });

  return completion;
}

function detectShell(): string {
  const shell = process.env.SHELL || '';

  if (shell.includes('zsh')) {
    return 'zsh';
  } else if (shell.includes('bash')) {
    return 'bash';
  }

  // Fallback to zsh if we can't detect
  return 'zsh';
}

async function installZshCompletion(): Promise<void> {
  const homeDir = homedir();

  // Try different zsh completion directories (prioritize user directories)
  const possibleDirs = [
    join(homeDir, '.oh-my-zsh', 'completions'),
    join(homeDir, '.zsh', 'completions'),
    join(homeDir, '.config', 'zsh', 'completions'),
    join(homeDir, '.local', 'share', 'zsh', 'site-functions'),
    '/usr/local/share/zsh/site-functions'
  ];

  let targetDir: string | null = null;

  // Find the first existing and writable directory
  for (const dir of possibleDirs) {
    if (existsSync(dir)) {
      try {
        // Check if we can write to this directory
        accessSync(dir, constants.W_OK);
        targetDir = dir;
        break;
      } catch {}
    }
  }

  // If no existing directory found, create one in user's home
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

  // Check if fpath already includes the directory
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
  } catch (_error) {
    // Ignore errors when checking .zshrc
  }
}

async function installBashCompletion(): Promise<void> {
  const homeDir = homedir();

  // Try different bash completion directories (prioritize user directories)
  const possibleDirs = [
    join(homeDir, '.bash_completion.d'),
    join(homeDir, '.local', 'share', 'bash-completion', 'completions'),
    '/usr/local/etc/bash_completion.d',
    '/etc/bash_completion.d'
  ];

  let targetDir: string | null = null;

  // Find the first existing and writable directory
  for (const dir of possibleDirs) {
    if (existsSync(dir)) {
      try {
        // Check if we can write to this directory
        accessSync(dir, constants.W_OK);
        targetDir = dir;
        break;
      } catch {}
    }
  }

  // If no existing directory found, create one in user's home
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
