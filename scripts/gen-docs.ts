import { readFileSync, writeFileSync } from 'node:fs';
import { docsCommands } from '../src/cli/catalog';
import {
  type CommandDefinition,
  CommandFlagType,
  type ParentCommandDefinition,
  type SubCommandDefinition
} from '../src/cli/types';

const readmePath = 'README.md';
const startMarker = '<!-- <DYNFIELD:COMMANDS> -->';
const endMarker = '<!-- </DYNFIELD:COMMANDS> -->';
const docsBinName = 'gs';

const readme = readFileSync(readmePath, 'utf-8');
const generated = generateCommandDocs(docsCommands);

if (countOccurrences(readme, startMarker) !== 1 || countOccurrences(readme, endMarker) !== 1) {
  throw new Error(`README.md must contain ${startMarker} and ${endMarker}`);
}

writeFileSync(readmePath, replaceBetween(readme, startMarker, endMarker, generated), 'utf-8');

function generateCommandDocs(commands: readonly CommandDefinition[]) {
  const lines = commands.flatMap((command, index) => {
    const commandLines = command.kind === 'command' ? parentCommandDocs(command) : commandDocs(command);
    return index === 0 ? commandLines : ['', ...commandLines];
  });
  return ['```sh', ...lines, '```'].join('\n');
}

function parentCommandDocs(command: ParentCommandDefinition) {
  if (command.name === 'completion') {
    return [`# ${command.name} commands`, ...completionShellUsages(command.name)];
  }
  const parentUsage = command.arguments?.length ? [commandUsage(command.name, parentUsageSuffix(command))] : [];
  return [
    `# ${command.name} commands`,
    ...parentUsage,
    ...command.subcommands.flatMap((subcommand) => commandDocs(subcommand, command.name))
  ];
}

function commandDocs(command: SubCommandDefinition, parent?: string) {
  const commandPath = parent ? `${parent} ${command.name}` : command.name;
  if (commandPath === 'completion') {
    return completionShellUsages(commandPath);
  }
  return [commandUsage(commandPath, usageSuffix(command))];
}

function completionShellUsages(commandPath: string) {
  return ['zsh', 'bash', 'fish'].map((shell) => commandUsage(commandPath, ` ${shell}`));
}

function commandUsage(commandPath: string, suffix: string) {
  return `${docsBinName} ${commandPath}${suffix}`;
}

function usageSuffix(command: SubCommandDefinition) {
  const args = command.arguments?.map((arg) => (arg.required ? `<${arg.name}>` : `[${arg.name}]`)) ?? [];
  const flags = command.flags?.map((flag) => flagUsage(flag)) ?? [];
  return [...args, ...flags].length > 0 ? ` ${[...args, ...flags].join(' ')}` : '';
}

function parentUsageSuffix(command: ParentCommandDefinition) {
  const args = command.arguments?.map((arg) => (arg.required ? `<${arg.name}>` : `[${arg.name}]`)) ?? [];
  return args.length > 0 ? ` ${args.join(' ')}` : '';
}

function flagUsage(flag: NonNullable<SubCommandDefinition['flags']>[number]) {
  const value = flag.type === CommandFlagType.Boolean ? '' : ' <value>';
  return flag.required ? `${flag.name}${value}` : `[${flag.name}${value}]`;
}

function replaceBetween(source: string, start: string, end: string, replacement: string) {
  const before = source.slice(0, source.indexOf(start) + start.length);
  const after = source.slice(source.indexOf(end));
  return `${before}\n${replacement}\n${after}`;
}

function countOccurrences(source: string, value: string) {
  return source.split(value).length - 1;
}
