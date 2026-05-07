import { readFileSync, writeFileSync } from 'node:fs';
import { docsCommands } from '../src/commands/catalog';
import {
  type CommandArgument,
  type CommandDefinition,
  type CommandFlag,
  CommandFlagType,
  type ParentCommandDefinition,
  type SubCommandDefinition
} from '../src/commands/types';

const readmePath = 'README.md';
const startMarker = '<!-- COMMANDS:START -->';
const endMarker = '<!-- COMMANDS:END -->';

const readme = readFileSync(readmePath, 'utf-8');
const generated = generateCommandDocs(docsCommands);

if (countOccurrences(readme, startMarker) !== 1 || countOccurrences(readme, endMarker) !== 1) {
  throw new Error(`README.md must contain ${startMarker} and ${endMarker}`);
}

writeFileSync(readmePath, replaceBetween(readme, startMarker, endMarker, generated), 'utf-8');

function generateCommandDocs(commands: readonly CommandDefinition[]) {
  return commands
    .map((command) => (command.kind === 'command' ? parentCommandDocs(command) : commandDocs(command)))
    .join('\n\n');
}

function parentCommandDocs(command: ParentCommandDefinition) {
  const title = command.name[0].toUpperCase() + command.name.slice(1);
  const parentUsage = command.arguments?.length
    ? [
        `**${command.name}** - ${command.description}`,
        '',
        '```bash',
        `sheet-cmd ${command.name}${parentUsageSuffix(command)}`,
        '```',
        '',
        argumentList(command.arguments)
      ].join('\n')
    : '';
  const subcommands = command.subcommands.map((subcommand) => commandDocs(subcommand, command.name)).join('\n\n');

  return `### ${title} Commands\n\n${parentUsage}${parentUsage ? '\n\n' : ''}${subcommands}`;
}

function commandDocs(command: SubCommandDefinition, parent?: string) {
  const heading = parent ? '' : `### ${command.name[0].toUpperCase() + command.name.slice(1)}\n\n`;
  const commandPath = parent ? `${parent} ${command.name}` : command.name;
  const lines = [
    `**${command.name}** - ${command.description}`,
    '',
    '```bash',
    `sheet-cmd ${commandPath}${usageSuffix(command)}`,
    '```'
  ];

  if (command.flags && command.flags.length > 0) {
    lines.push('', optionList(command.flags));
  }

  if (command.arguments && command.arguments.length > 0) {
    lines.push('', argumentList(command.arguments));
  }

  return `${heading}${lines.join('\n')}`;
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

function flagUsage(flag: CommandFlag) {
  const value = flag.type === CommandFlagType.Boolean ? '' : ' <value>';
  return flag.required ? `${flag.name}${value}` : `[${flag.name}${value}]`;
}

function optionList(flags: readonly CommandFlag[]) {
  return [
    'Options:',
    ...flags.map((flag) => `- \`${flagLabel(flag)}\`: ${flag.description}${flag.required ? ' (required)' : ''}`)
  ].join('\n');
}

function argumentList(args: readonly CommandArgument[]) {
  return [
    'Arguments:',
    ...args.map((arg) => `- \`${arg.name}\`: ${arg.description}${arg.required ? ' (required)' : ''}`)
  ].join('\n');
}

function flagLabel(flag: CommandFlag) {
  const value = flag.type === CommandFlagType.Boolean ? '' : ' <value>';
  return flag.alias ? `${flag.alias}, ${flag.name}${value}` : `${flag.name}${value}`;
}

function replaceBetween(source: string, start: string, end: string, replacement: string) {
  const before = source.slice(0, source.indexOf(start) + start.length);
  const after = source.slice(source.indexOf(end));
  return `${before}\n${replacement}\n${after}`;
}

function countOccurrences(source: string, value: string) {
  return source.split(value).length - 1;
}
