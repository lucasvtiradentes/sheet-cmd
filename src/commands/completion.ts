import { accessSync, constants, existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { homedir } from 'node:os';
import { join } from 'node:path';
import chalk from 'chalk';
import { Command } from 'commander';

import { ConfigManager } from '../config/config-manager.js';
import { Logger } from '../utils/logger.js';

const ZSH_COMPLETION_SCRIPT = `#compdef sheet-cmd sheet

_sheet_cmd() {
    local state line context
    typeset -A opt_args

    _arguments -C \\
        '1: :_sheet_cmd_commands' \\
        '*::arg:->args'

    case $state in
        args)
            case $line[1] in
                account)
                    _sheet_cmd_account
                    ;;
                spreadsheet)
                    _sheet_cmd_spreadsheet
                    ;;
                sheet)
                    _sheet_cmd_sheet
                    ;;
                completion)
                    _sheet_cmd_completion
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
        'account:Manage Google accounts'
        'spreadsheet:Manage spreadsheet configurations'
        'sheet:Manage and interact with Google Sheets'
        'update:Update sheet-cmd to latest version'
        'completion:Generate shell completion scripts'
    )
    _describe 'command' commands
}

_sheet_cmd_account() {
    local curcontext="$curcontext" state line
    typeset -A opt_args

    _arguments -C \\
        '1: :_sheet_cmd_account_commands' \\
        '*::arg:->args'
}

_sheet_cmd_account_commands() {
    local account_commands
    account_commands=(
        'add:Add a Google account via OAuth'
        'list:List all configured Google accounts'
        'switch:Switch active Google account'
        'remove:Remove a Google account'
        'reauth:Re-authenticate the active account'
    )
    _describe 'account command' account_commands
}

_sheet_cmd_spreadsheet() {
    local curcontext="$curcontext" state line
    typeset -A opt_args

    _arguments -C \\
        '1: :_sheet_cmd_spreadsheet_commands' \\
        '*::arg:->args'
}

_sheet_cmd_spreadsheet_commands() {
    local spreadsheet_commands
    spreadsheet_commands=(
        'add:Add a new spreadsheet (interactive by default, use --id for manual)'
        'list:List all configured spreadsheets'
        'remove:Remove a spreadsheet configuration'
        'switch:Switch to a different spreadsheet (sets as active)'
        'active:Show the currently active spreadsheet'
    )
    _describe 'spreadsheet command' spreadsheet_commands
}

_sheet_cmd_sheet() {
    local curcontext="$curcontext" state line
    typeset -A opt_args

    _arguments -C \\
        '1: :_sheet_cmd_sheet_commands' \\
        '*::arg:->args'

    case $state in
        args)
            case $line[1] in
                list-sheets)
                    _arguments \\
                        '-s[Spreadsheet name]:spreadsheet:' \\
                        '--spreadsheet[Spreadsheet name]:spreadsheet:'
                    ;;
                read-sheet)
                    _arguments \\
                        '-n[Sheet name]:tab:' \\
                        '--name[Sheet name]:tab:' \\
                        '-s[Spreadsheet name]:spreadsheet:' \\
                        '--spreadsheet[Spreadsheet name]:spreadsheet:' \\
                        '-o[Output format]:format:(markdown csv)' \\
                        '--output[Output format]:format:(markdown csv)' \\
                        '-f[Include formulas]' \\
                        '--formulas[Include formulas]' \\
                        '-e[Export to file]:file:_files' \\
                        '--export[Export to file]:file:_files'
                    ;;
                add-sheet)
                    _arguments \\
                        '-n[Sheet name]:tab:' \\
                        '--name[Sheet name]:tab:' \\
                        '-s[Spreadsheet name]:spreadsheet:' \\
                        '--spreadsheet[Spreadsheet name]:spreadsheet:'
                    ;;
                remove-sheet)
                    _arguments \\
                        '-n[Sheet name]:tab:' \\
                        '--name[Sheet name]:tab:' \\
                        '-s[Spreadsheet name]:spreadsheet:' \\
                        '--spreadsheet[Spreadsheet name]:spreadsheet:'
                    ;;
                rename-sheet)
                    _arguments \\
                        '-n[Current sheet name]:tab:' \\
                        '--name[Current sheet name]:tab:' \\
                        '--new-name[New sheet name]:new:' \\
                        '-s[Spreadsheet name]:spreadsheet:' \\
                        '--spreadsheet[Spreadsheet name]:spreadsheet:'
                    ;;
                copy-sheet)
                    _arguments \\
                        '-n[Source sheet name]:tab:' \\
                        '--name[Source sheet name]:tab:' \\
                        '--to[Destination sheet name]:to:' \\
                        '-s[Spreadsheet name]:spreadsheet:' \\
                        '--spreadsheet[Spreadsheet name]:spreadsheet:'
                    ;;
                write-cell)
                    _arguments \\
                        '-n[Sheet name]:tab:' \\
                        '--name[Sheet name]:tab:' \\
                        '-c[Cell address]:cell:' \\
                        '--cell[Cell address]:cell:' \\
                        '-r[Range]:range:' \\
                        '--range[Range]:range:' \\
                        '-v[Value]:value:' \\
                        '--value[Value]:value:' \\
                        '-s[Spreadsheet name]:spreadsheet:' \\
                        '--spreadsheet[Spreadsheet name]:spreadsheet:'
                    ;;
                append-row)
                    _arguments \\
                        '-n[Sheet name]:tab:' \\
                        '--name[Sheet name]:tab:' \\
                        '-v[Values]:value:' \\
                        '--value[Values]:value:' \\
                        '-s[Spreadsheet name]:spreadsheet:' \\
                        '--spreadsheet[Spreadsheet name]:spreadsheet:'
                    ;;
                import-csv)
                    _arguments \\
                        '-n[Sheet name]:tab:' \\
                        '--name[Sheet name]:tab:' \\
                        '-f[CSV file]:file:_files' \\
                        '--file[CSV file]:file:_files' \\
                        '--skip-header[Skip header row]' \\
                        '-s[Spreadsheet name]:spreadsheet:' \\
                        '--spreadsheet[Spreadsheet name]:spreadsheet:'
                    ;;
                export)
                    _arguments \\
                        '-n[Sheet name]:tab:' \\
                        '--name[Sheet name]:tab:' \\
                        '-r[Range]:range:' \\
                        '--range[Range]:range:' \\
                        '-f[Format]:format:(json csv)' \\
                        '--format[Format]:format:(json csv)' \\
                        '-o[Output file]:file:_files' \\
                        '--output[Output file]:file:_files' \\
                        '-s[Spreadsheet name]:spreadsheet:' \\
                        '--spreadsheet[Spreadsheet name]:spreadsheet:'
                    ;;
            esac
            ;;
    esac
}

_sheet_cmd_sheet_commands() {
    local sheet_commands
    sheet_commands=(
        'list-sheets:List all sheets in a spreadsheet'
        'read-sheet:Read the complete content of a sheet tab'
        'add-sheet:Add a new sheet to the spreadsheet'
        'remove-sheet:Remove a sheet from the spreadsheet'
        'rename-sheet:Rename a sheet in the spreadsheet'
        'copy-sheet:Copy a sheet to a new sheet'
        'write-cell:Write to a specific cell or range of cells'
        'append-row:Append a new row to the end of the sheet'
        'import-csv:Import CSV file to a sheet tab'
        'export:Export sheet data to JSON or CSV format'
    )
    _describe 'sheet command' sheet_commands
}

_sheet_cmd_completion() {
    local completion_commands
    completion_commands=(
        'install:Install shell completion'
    )
    _describe 'completion command' completion_commands
}

_sheet_cmd "$@"
`;

const BASH_COMPLETION_SCRIPT = `#!/bin/bash

_sheet_cmd_completion() {
    local cur prev words cword
    _init_completion || return

    # Main commands
    local commands="account spreadsheet sheet update completion"

    # Account subcommands
    local account_commands="add list switch remove reauth"

    # Spreadsheet subcommands
    local spreadsheet_commands="add list remove switch active"

    # Sheet subcommands
    local sheet_commands="list-sheets read-sheet add-sheet remove-sheet rename-sheet copy-sheet write-cell append-row import-csv export"

    if [[ \\$cword -eq 1 ]]; then
        COMPREPLY=(\\$(compgen -W "\\$commands" -- "\\$cur"))
    elif [[ \\$cword -eq 2 ]]; then
        case "\\$\{COMP_WORDS[1]}" in
            account)
                COMPREPLY=(\\$(compgen -W "\\$account_commands" -- "\\$cur"))
                ;;
            spreadsheet)
                COMPREPLY=(\\$(compgen -W "\\$spreadsheet_commands" -- "\\$cur"))
                ;;
            sheet)
                COMPREPLY=(\\$(compgen -W "\\$sheet_commands" -- "\\$cur"))
                ;;
            completion)
                COMPREPLY=(\\$(compgen -W "install" -- "\\$cur"))
                ;;
        esac
    elif [[ \\$cword -ge 3 ]]; then
        # Handle flags based on command and subcommand
        case "\\$\{COMP_WORDS[1]}" in
            sheet)
                case "\\$\{COMP_WORDS[2]}" in
                    list-sheets)
                        if [[ \\$cur == -* ]]; then
                            COMPREPLY=(\\$(compgen -W "-s --spreadsheet" -- "\\$cur"))
                        fi
                        ;;
                    read-sheet)
                        if [[ \\$cur == -* ]]; then
                            COMPREPLY=(\\$(compgen -W "-n --name -s --spreadsheet -o --output -f --formulas -e --export" -- "\\$cur"))
                        elif [[ \\$prev == "-o" || \\$prev == "--output" ]]; then
                            COMPREPLY=(\\$(compgen -W "markdown csv" -- "\\$cur"))
                        elif [[ \\$prev == "-e" || \\$prev == "--export" ]]; then
                            COMPREPLY=(\\$(compgen -f -- "\\$cur"))
                        fi
                        ;;
                    add-sheet)
                        if [[ \\$cur == -* ]]; then
                            COMPREPLY=(\\$(compgen -W "-n --name -s --spreadsheet" -- "\\$cur"))
                        fi
                        ;;
                    remove-sheet)
                        if [[ \\$cur == -* ]]; then
                            COMPREPLY=(\\$(compgen -W "-n --name -s --spreadsheet" -- "\\$cur"))
                        fi
                        ;;
                    rename-sheet)
                        if [[ \\$cur == -* ]]; then
                            COMPREPLY=(\\$(compgen -W "-n --name --new-name -s --spreadsheet" -- "\\$cur"))
                        fi
                        ;;
                    copy-sheet)
                        if [[ \\$cur == -* ]]; then
                            COMPREPLY=(\\$(compgen -W "-n --name --to -s --spreadsheet" -- "\\$cur"))
                        fi
                        ;;
                    write-cell)
                        if [[ \\$cur == -* ]]; then
                            COMPREPLY=(\\$(compgen -W "-n --name -c --cell -r --range -v --value -s --spreadsheet" -- "\\$cur"))
                        fi
                        ;;
                    append-row)
                        if [[ \\$cur == -* ]]; then
                            COMPREPLY=(\\$(compgen -W "-n --name -v --value -s --spreadsheet" -- "\\$cur"))
                        fi
                        ;;
                    import-csv)
                        if [[ \\$cur == -* ]]; then
                            COMPREPLY=(\\$(compgen -W "-n --name -f --file --skip-header -s --spreadsheet" -- "\\$cur"))
                        elif [[ \\$prev == "-f" || \\$prev == "--file" ]]; then
                            COMPREPLY=(\\$(compgen -f -- "\\$cur"))
                        fi
                        ;;
                    export)
                        if [[ \\$cur == -* ]]; then
                            COMPREPLY=(\\$(compgen -W "-n --name -r --range -f --format -o --output -s --spreadsheet" -- "\\$cur"))
                        elif [[ \\$prev == "-f" || \\$prev == "--format" ]]; then
                            COMPREPLY=(\\$(compgen -W "json csv" -- "\\$cur"))
                        elif [[ \\$prev == "-o" || \\$prev == "--output" ]]; then
                            COMPREPLY=(\\$(compgen -f -- "\\$cur"))
                        fi
                        ;;
                esac
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

        const configManager = new ConfigManager();
        configManager.markCompletionInstalled();
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
  } catch (_error) {
  }
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
      } catch {
        /* continue */
      }
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
      } catch {
        /* continue */
      }
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
  } catch {
  }
}
