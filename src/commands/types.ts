type CommandFlagType = 'string' | 'boolean';

export type CommandFlag<
  Name extends string = string,
  Type extends CommandFlagType = CommandFlagType,
  Required extends boolean | undefined = boolean | undefined
> = {
  name: Name;
  alias?: string;
  description: string;
  type: Type;
  required?: Required;
};

export type CommandArgument<
  Name extends string = string,
  Type extends 'string' = 'string',
  Required extends boolean | undefined = boolean | undefined
> = {
  name: Name;
  description: string;
  type: Type;
  required?: Required;
};

type CommandActionContext<
  Args extends readonly CommandArgument[] = readonly CommandArgument[],
  Flags extends readonly CommandFlag[] = readonly CommandFlag[]
> = {
  args: InferArgs<Args>;
  options: InferOptions<Flags>;
};

export type SubCommandDefinition<
  Args extends readonly CommandArgument[] = readonly CommandArgument[],
  Flags extends readonly CommandFlag[] = readonly CommandFlag[]
> = {
  kind: 'subcommand';
  name: string;
  aliases?: string[];
  description: string;
  arguments?: Args;
  flags?: Flags;
  errorMessage?: string | ((error: unknown) => string);
  action: (context: CommandActionContext<Args, Flags>) => void | Promise<void>;
};

export type ParentCommandDefinition<
  Subcommands extends readonly SubCommandDefinition[] = readonly SubCommandDefinition[]
> = {
  kind: 'command';
  name: string;
  aliases?: string[];
  description: string;
  arguments?: readonly CommandArgument[];
  subcommands: Subcommands;
  errorMessage?: string | ((error: unknown) => string);
};

export type CommandDefinition = ParentCommandDefinition | SubCommandDefinition;

export type InferOptions<Flags extends readonly CommandFlag[] | undefined> = Flags extends readonly CommandFlag[]
  ? Simplify<UnionToIntersection<OptionFromFlag<Flags[number]>>>
  : Record<string, never>;

export type InferArgs<Args extends readonly CommandArgument[] | undefined> = Args extends readonly CommandArgument[]
  ? Simplify<UnionToIntersection<ArgFromDefinition<Args[number]>>>
  : Record<string, never>;

type OptionFromFlag<Flag extends CommandFlag> = Flag extends unknown
  ? true extends Flag['required']
    ? { [Key in FlagOptionKey<Flag['name']>]: FlagValue<Flag['type']> }
    : { [Key in FlagOptionKey<Flag['name']>]?: FlagValue<Flag['type']> }
  : never;

type ArgFromDefinition<Arg extends CommandArgument> = Arg extends unknown
  ? true extends Arg['required']
    ? { [Key in CamelCase<Arg['name']>]: ArgValue }
    : { [Key in CamelCase<Arg['name']>]?: ArgValue }
  : never;

type FlagValue<Type extends CommandFlagType> = Type extends 'boolean' ? boolean : string;

type ArgValue = string;

type FlagOptionKey<Name extends string> = CamelCase<StripNoPrefix<StripLongFlagPrefix<Name>>>;

type StripLongFlagPrefix<Value extends string> = Value extends `--${infer Rest}`
  ? Rest
  : Value extends `-${infer Rest}`
    ? Rest
    : Value;

type StripNoPrefix<Value extends string> = Value extends `no-${infer Rest}` ? Rest : Value;

type CamelCase<Value extends string> = Value extends `${infer Head}-${infer Tail}`
  ? `${Head}${Capitalize<CamelCase<Tail>>}`
  : Value;

type UnionToIntersection<Union> = (Union extends unknown ? (value: Union) => void : never) extends (
  value: infer Intersection
) => void
  ? Intersection
  : never;

type Simplify<T> = { [Key in keyof T]: T[Key] } & {};
