import type { Command } from '@caporal/core';
import { CLI_BIN_NAMES, DEV_CLI_BIN_NAMES } from '../../config/constants';

export type CompletionGroup = {
  description?: string;
  name: string;
};

export type CompletionOption = {
  description?: string;
  long?: string;
  names: string[];
  short?: string;
};

export const globalOptions: CompletionOption[] = [
  { description: 'Show help', long: 'help', names: ['-h', '--help'], short: 'h' },
  { description: 'Show version', long: 'version', names: ['-V', '--version'], short: 'V' }
];

export function isVisibleCompletionCommand(command: Command) {
  return command.visible;
}

export function getCompletionBinNames(binName: string) {
  const aliases = DEV_CLI_BIN_NAMES.includes(binName) ? DEV_CLI_BIN_NAMES : CLI_BIN_NAMES;
  return [...new Set([binName, ...aliases])];
}

export function getRootCommands(commands: Command[]) {
  const roots = new Map<string, CompletionGroup>();

  for (const command of commands) {
    const parts = command.name.split(' ');
    const root = parts[0];
    if (!root || roots.has(root)) continue;

    roots.set(root, {
      name: root,
      description: command.description
    });
  }

  return [...roots.values()];
}

export function getSubcommandGroups(commands: Command[]) {
  const groups = new Map<string, CompletionGroup[]>();

  for (const command of commands) {
    const [root, subcommand] = command.name.split(' ');
    if (!root || !subcommand) continue;

    const group = groups.get(root) ?? [];
    if (!group.some((item) => item.name === subcommand)) {
      group.push({ name: subcommand, description: command.description });
    }
    groups.set(root, group);
  }

  return groups;
}

export function getOptionGroups(commands: Command[]) {
  const groups = new Map<string, CompletionOption[]>();

  for (const command of commands) {
    const options = command.options.filter((option) => option.visible);
    if (options.length === 0) continue;

    groups.set(
      command.name,
      options.map((option) => ({
        description: option.description,
        long: option.allNotations.find((notation) => notation.startsWith('--'))?.replace(/^--/, ''),
        names: option.allNotations,
        short: option.allNotations.find((notation) => /^-[^-]/.test(notation))?.replace(/^-/, '')
      }))
    );
  }

  return groups;
}

export function commandKey(command: string) {
  return command.replace(/\W+/g, '_');
}

export function optionWords(items: CompletionOption[]) {
  return items.flatMap((item) => item.names).join(' ');
}

export function getFunctionName(binName: string) {
  return `_${commandKey(binName)}_completion`;
}
