import {
  type CommandArgument,
  type CommandFlag,
  CommandFlagType,
  type ParentCommandDefinition,
  type SubCommandDefinition
} from './types';

export function defineCommand<const Subcommands extends readonly SubCommandDefinition[]>(
  definition: Omit<ParentCommandDefinition<Subcommands>, 'kind'>
): ParentCommandDefinition<Subcommands> {
  return { kind: 'command', ...definition };
}

export function defineSubCommand<
  const Args extends readonly CommandArgument[],
  const Flags extends readonly CommandFlag[]
>(definition: Omit<SubCommandDefinition<Args, Flags>, 'kind'>): SubCommandDefinition<Args, Flags> {
  return { kind: 'subcommand', ...definition };
}

export const flag = {
  string<const Name extends string, const Required extends boolean | undefined = undefined>(
    name: Name,
    description: string,
    options?: { alias?: string; required?: Required }
  ): CommandFlag<Name, CommandFlagType.String, Required> {
    return { name, description, type: CommandFlagType.String, ...options };
  },

  boolean<const Name extends string, const Required extends boolean | undefined = undefined>(
    name: Name,
    description: string,
    options?: { alias?: string; required?: Required }
  ): CommandFlag<Name, CommandFlagType.Boolean, Required> {
    return { name, description, type: CommandFlagType.Boolean, ...options };
  }
};

export const argument = {
  string<const Name extends string, const Required extends boolean | undefined = undefined>(
    name: Name,
    description: string,
    options?: { required?: Required }
  ): CommandArgument<Name, 'string', Required> {
    return { name, description, type: 'string', ...options };
  }
};
