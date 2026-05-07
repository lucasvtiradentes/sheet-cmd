import { type CompletionGroup, type CompletionOption, commandKey, globalOptions } from './shared';

export function getFishCompletionScript(
  binNames: string[],
  roots: CompletionGroup[],
  subcommands: Map<string, CompletionGroup[]>,
  options: Map<string, CompletionOption[]>
) {
  return binNames.map((binName) => getFishCompletionForBin(binName, roots, subcommands, options)).join('\n');
}

function getFishCompletionForBin(
  binName: string,
  roots: CompletionGroup[],
  subcommands: Map<string, CompletionGroup[]>,
  options: Map<string, CompletionOption[]>
) {
  const rootNames = roots.map((item) => item.name).join(' ');
  return `function __${commandKey(binName)}_seen_command
  set -l tokens (commandline -opc)
  for token in $tokens[2..-1]
    switch $token
      case ${rootNames}
        return 0
    end
  end
  return 1
end

function __${commandKey(binName)}_using_command
  set -l tokens (commandline -opc)
  test (count $tokens) -ge 2; and test "$tokens[2]" = "$argv[1]"
end

function __${commandKey(binName)}_using_subcommand
  set -l tokens (commandline -opc)
  test (count $tokens) -ge 3; and test "$tokens[2]" = "$argv[1]"; and test "$tokens[3]" = "$argv[2]"
end

complete -c ${binName} -f
${formatFishRootCompletions(binName, roots)}
${formatFishSubcommandCompletions(binName, subcommands)}
${formatFishOptionCompletions(binName, subcommands, options)}
${formatFishGlobalOptionCompletions(binName)}`;
}

function formatFishRootCompletions(binName: string, roots: CompletionGroup[]) {
  return roots
    .map(
      (item) =>
        `complete -c ${binName} -f -n "not __${commandKey(binName)}_seen_command" -a ${quoteFish(item.name)} -d ${quoteFish(item.description ?? '')}`
    )
    .join('\n');
}

function formatFishSubcommandCompletions(binName: string, groups: Map<string, CompletionGroup[]>) {
  return [...groups.entries()]
    .flatMap(([root, items]) =>
      items.map(
        (item) =>
          `complete -c ${binName} -f -n "__${commandKey(binName)}_using_command ${quoteFish(root)}" -a ${quoteFish(item.name)} -d ${quoteFish(item.description ?? '')}`
      )
    )
    .join('\n');
}

function formatFishOptionCompletions(
  binName: string,
  subcommands: Map<string, CompletionGroup[]>,
  options: Map<string, CompletionOption[]>
) {
  return [...options.entries()]
    .flatMap(([command, items]) => {
      const parts = command.split(' ');
      const condition =
        parts.length === 1
          ? `__${commandKey(binName)}_using_command ${quoteFish(parts[0] ?? '')}`
          : `__${commandKey(binName)}_using_subcommand ${quoteFish(parts[0] ?? '')} ${quoteFish(parts[1] ?? '')}`;
      if (parts.length > 1 && !(subcommands.get(parts[0] ?? '') ?? []).some((item) => item.name === parts[1])) {
        return [];
      }

      return items.map((item) => {
        const flags = [item.short ? `-s ${quoteFish(item.short)}` : '', item.long ? `-l ${quoteFish(item.long)}` : '']
          .filter(Boolean)
          .join(' ');
        return `complete -c ${binName} -f -n "${condition}" ${flags} -d ${quoteFish(item.description ?? '')}`;
      });
    })
    .join('\n');
}

function formatFishGlobalOptionCompletions(binName: string) {
  return globalOptions
    .map((item) => {
      const flags = [item.short ? `-s ${quoteFish(item.short)}` : '', item.long ? `-l ${quoteFish(item.long)}` : '']
        .filter(Boolean)
        .join(' ');
      return `complete -c ${binName} -f ${flags} -d ${quoteFish(item.description ?? '')}`;
    })
    .join('\n');
}

function quoteFish(value: string) {
  return `'${value.replace(/\\/g, '\\\\').replace(/'/g, "\\'")}'`;
}
