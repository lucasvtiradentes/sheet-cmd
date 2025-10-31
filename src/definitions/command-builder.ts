import { Command } from 'commander';
import { handleCommandError } from '../utils/error-handler.js';
import { getCommand, getSubCommand } from './commands.js';

export function createCommandFromSchema(
  commandName: string,
  action?: () => void | Promise<void>,
  errorMessageFn?: string | ((error: unknown) => string)
): Command {
  const schema = getCommand(commandName);

  if (!schema) {
    throw new Error(`Command "${commandName}" not found in schema`);
  }

  const command = new Command(schema.name);
  command.description(schema.description);

  if (schema.aliases && schema.aliases.length > 0) {
    for (const alias of schema.aliases) {
      command.alias(alias);
    }
  }

  if (action) {
    const wrappedAction = async () => {
      const commandPromise = async () => {
        await action();
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
  commandName: string,
  subCommandName: string,
  action: (...args: TArgs) => void | Promise<void>,
  errorMessageFn?: string | ((error: unknown) => string)
): Command {
  const schema = getSubCommand(commandName, subCommandName);

  if (!schema) {
    throw new Error(`SubCommand "${commandName} ${subCommandName}" not found in schema`);
  }

  const command = new Command(schema.name);
  command.description(schema.description);

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

      if (flag.required) {
        command.requiredOption(flagString, flag.description);
      } else {
        command.option(flagString, flag.description);
      }
    }
  }

  const wrappedAction = async (...args: TArgs) => {
    const commandPromise = async () => {
      await action(...args);
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
