import type { Command as CaporalCommand, Program as CaporalProgram } from '@caporal/core';
import { APP_INFO } from '../config/constants';
import { handleCommandError } from '../utils/error-handler';
import { getCommand, getSubCommand } from './commands';

export function createCommandFromSchema(
  program: CaporalProgram,
  commandName: string,
  action?: () => void | Promise<void>,
  errorMessageFn?: string | ((error: unknown) => string)
): CaporalCommand {
  const schema = getCommand(commandName);

  if (!schema) {
    throw new Error(`Command "${commandName}" not found in schema`);
  }

  const command = program.command(schema.name, schema.description);

  if (schema.aliases && schema.aliases.length > 0) {
    for (const alias of schema.aliases) {
      command.alias(alias);
    }
  }

  const commandAction =
    action ??
    (schema.subcommands
      ? () => {
          console.log(`Usage: ${APP_INFO.name} ${schema.name} <command>`);
          console.log('');
          console.log(`Available commands: ${schema.subcommands?.map((subcommand) => subcommand.name).join(', ')}`);
        }
      : undefined);

  if (commandAction) {
    const wrappedAction = async () => {
      const commandPromise = async () => {
        await commandAction();
      };

      const baseMessage = errorMessageFn
        ? typeof errorMessageFn === 'function'
          ? errorMessageFn
          : () => errorMessageFn
        : () => `Failed to execute: ${commandName}`;

      await commandPromise().catch(handleCommandError(baseMessage));
    };

    command.action(wrappedAction);
  }

  return command;
}

export function createSubCommandFromSchema<TArgs extends unknown[] = unknown[]>(
  program: CaporalProgram,
  commandName: string,
  subCommandName: string,
  action: (...args: TArgs) => void | Promise<void>,
  errorMessageFn?: string | ((error: unknown) => string)
): CaporalCommand {
  const schema = getSubCommand(commandName, subCommandName);

  if (!schema) {
    throw new Error(`SubCommand "${commandName} ${subCommandName}" not found in schema`);
  }

  const command = program.command(`${commandName} ${schema.name}`, schema.description);

  if (schema.aliases && schema.aliases.length > 0) {
    for (const alias of schema.aliases) {
      command.alias(alias);
    }
  }

  if (schema.arguments && schema.arguments.length > 0) {
    for (const arg of schema.arguments) {
      const argString = arg.required ? `<${arg.name}>` : `[${arg.name}]`;
      command.argument(argString, arg.description);
    }
  }

  if (schema.flags && schema.flags.length > 0) {
    for (const flag of schema.flags) {
      let flagString = flag.name;

      if (flag.alias) {
        flagString = `${flag.alias}, ${flagString}`;
      }

      if (flag.type === 'string') {
        flagString += ' <value>';
      } else if (flag.type === 'number') {
        flagString += ' <number>';
      }

      command.option(flagString, flag.description, { required: flag.required });
    }
  }

  const wrappedAction = async ({ args, options }: { args: Record<string, unknown>; options: unknown }) => {
    const commandPromise = async () => {
      const argsValues = Object.values(args);
      await action(...((argsValues.length > 0 ? argsValues : [options]) as TArgs));
    };

    const baseMessage = errorMessageFn
      ? typeof errorMessageFn === 'function'
        ? errorMessageFn
        : () => errorMessageFn
      : () => `Failed to execute: ${commandName} ${subCommandName}`;

    await commandPromise().catch(handleCommandError(baseMessage));
  };

  command.action(wrappedAction);

  return command;
}

export function getCommandDescription(commandName: string): string {
  const schema = getCommand(commandName);
  return schema?.description || '';
}

export function getSubCommandDescription(commandName: string, subCommandName: string): string {
  const schema = getSubCommand(commandName, subCommandName);
  return schema?.description || '';
}
