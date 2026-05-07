import { APP_INFO } from '../../config/constants';
import { type CompletionGroup, type CompletionOption, commandKey, getFunctionName, globalOptions } from './shared';

export function getZshCompletionScript(
  binNames: string[],
  roots: CompletionGroup[],
  subcommands: Map<string, CompletionGroup[]>,
  options: Map<string, CompletionOption[]>
) {
  const functionName = getFunctionName(binNames[0] ?? APP_INFO.name);
  return `#compdef ${binNames.join(' ')}

${functionName}() {
  local -a commands
  commands=(
${formatZshItems(roots)}
  )
  local -a global_options
  global_options=(
${formatZshOptionItems(globalOptions)}
  )
${formatSubcommandArrays(subcommands)}
${formatZshOptionArrays(options)}

  if [[ "$words[CURRENT]" == -* ]]; then
    _describe '${binNames[0]} options' global_options
    return
  fi

  if (( CURRENT == 2 )); then
    _describe '${binNames[0]} commands' commands
    return
  fi

  case $words[2] in
${formatZshCompletionCases(binNames[0] ?? APP_INFO.name, subcommands, options)}
  esac
}

compdef ${functionName} ${binNames.join(' ')}`;
}

function formatZshItems(items: CompletionGroup[]) {
  return items.map((item) => `    '${escapeZshItem(item)}'`).join('\n');
}

function formatZshOptionItems(items: CompletionOption[]) {
  return items
    .flatMap((item) =>
      item.names.map((name) => ({
        description: item.description,
        name
      }))
    )
    .map((item) => `    '${escapeZshItem(item)}'`)
    .join('\n');
}

function formatSubcommandArrays(groups: Map<string, CompletionGroup[]>) {
  return [...groups.entries()]
    .map(
      ([root, items]) => `
  local -a ${commandKey(root)}_commands
  ${commandKey(root)}_commands=(
${formatZshItems(items)}
  )`
    )
    .join('\n');
}

function formatZshOptionArrays(groups: Map<string, CompletionOption[]>) {
  return [...groups.entries()]
    .map(
      ([command, items]) => `
  local -a ${commandKey(command)}_options
  ${commandKey(command)}_options=(
${formatZshOptionItems(items)}
  )`
    )
    .join('\n');
}

function formatZshCompletionCases(
  binName: string,
  subcommands: Map<string, CompletionGroup[]>,
  options: Map<string, CompletionOption[]>
) {
  const rootCommands = new Set(
    [...subcommands.keys(), ...[...options.keys()].map((command) => command.split(' ')[0])].filter(
      (command): command is string => Boolean(command)
    )
  );

  return [...rootCommands]
    .map((root) => {
      const rootOptions = options.get(root);
      if (rootOptions) {
        return `    ${root})
      _describe '${binName} ${root} options' ${commandKey(root)}_options
      ;;`;
      }

      const subcommandCases = (subcommands.get(root) ?? [])
        .map((item) => {
          const key = `${root} ${item.name}`;
          if (!options.has(key)) return '';
          return `        ${item.name})
          _describe '${binName} ${root} ${item.name} options' ${commandKey(key)}_options
          ;;`;
        })
        .filter(Boolean)
        .join('\n');

      return `    ${root})
      if (( CURRENT == 3 )) && [[ $words[CURRENT] != -* ]]; then
        _describe '${binName} ${root} commands' ${commandKey(root)}_commands
        return
      fi
      case $words[3] in
${subcommandCases}
      esac
      ;;`;
    })
    .join('\n');
}

function escapeZshItem(item: CompletionGroup) {
  const text = item.description ? `${item.name}:${item.description}` : item.name;
  return text.replace(/'/g, "'\\''");
}
