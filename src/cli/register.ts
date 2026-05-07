import type { Command as CaporalCommand, Program as CaporalProgram } from '@caporal/core';
import { getProgramName } from '../config/constants';
import { handleCommandError } from '../utils/error-handler';
import {
  type CommandArgument,
  type CommandDefinition,
  type CommandFlag,
  CommandFlagType,
  type ParentCommandDefinition,
  type SubCommandDefinition
} from './types';

export function registerProgram(program: CaporalProgram, commands: readonly CommandDefinition[]): void {
  for (const command of commands) {
    if (command.kind === 'command') {
      registerParentCommand(program, command);
      for (const subcommand of command.subcommands) {
        registerSubCommand(program, command.name, subcommand);
      }
      continue;
    }

    registerSubCommand(program, undefined, command);
  }
}

function registerParentCommand(program: CaporalProgram, definition: ParentCommandDefinition): CaporalCommand {
  const command = program.command(definition.name, definition.description);
  applyAliases(command, definition.aliases);

  command.action(async () => {
    const commandPromise = async () => {
      console.log(`Usage: ${getProgramName()} ${definition.name} <command>`);
      console.log('');
      console.log(`Available commands: ${definition.subcommands.map((subcommand) => subcommand.name).join(', ')}`);
    };

    await commandPromise().catch(
      handleCommandError(resolveErrorMessage(definition.errorMessage, `Failed to execute: ${definition.name}`))
    );
  });

  return command;
}

function registerSubCommand(
  program: CaporalProgram,
  parentName: string | undefined,
  definition: SubCommandDefinition
): CaporalCommand {
  const commandName = parentName ? `${parentName} ${definition.name}` : definition.name;
  const command = program.command(commandName, definition.description);

  applyAliases(command, definition.aliases);
  applyArguments(command, definition.arguments);
  applyFlags(command, definition.flags);

  command.action(async ({ args, options }: { args: Record<string, unknown>; options: Record<string, unknown> }) => {
    const commandPromise = async () => {
      await definition.action({
        args: args as Record<string, string>,
        options: options as Record<string, string | boolean>
      });
    };

    await commandPromise().catch(
      handleCommandError(resolveErrorMessage(definition.errorMessage, `Failed to execute: ${commandName}`))
    );
  });

  return command;
}

function applyAliases(command: CaporalCommand, aliases: readonly string[] | undefined): void {
  if (!aliases) return;

  for (const alias of aliases) {
    command.alias(alias);
  }
}

function applyArguments(command: CaporalCommand, args: readonly CommandArgument[] | undefined): void {
  if (!args) return;

  for (const arg of args) {
    const argString = arg.required ? `<${arg.name}>` : `[${arg.name}]`;
    command.argument(argString, arg.description);
  }
}

function applyFlags(command: CaporalCommand, flags: readonly CommandFlag[] | undefined): void {
  if (!flags) return;

  for (const flag of flags) {
    let flagString = flag.name;

    if (flag.alias) {
      flagString = `${flag.alias}, ${flagString}`;
    }

    if (flag.type === CommandFlagType.String) {
      flagString += ' <value>';
    }

    command.option(flagString, flag.description, {
      required: flag.required,
      default: flag.name.startsWith('--no-') ? true : undefined
    });
  }
}

function resolveErrorMessage(errorMessage: string | ((error: unknown) => string) | undefined, fallback: string) {
  if (!errorMessage) return () => fallback;
  if (typeof errorMessage === 'function') return errorMessage;
  return () => errorMessage;
}
