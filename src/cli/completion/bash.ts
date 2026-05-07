import { type CompletionGroup, type CompletionOption, getFunctionName, globalOptions, optionWords } from './shared';

export function getBashCompletionScript(
  binNames: string[],
  roots: CompletionGroup[],
  subcommands: Map<string, CompletionGroup[]>,
  _options: Map<string, CompletionOption[]>
) {
  const functionName = getFunctionName(binNames[0] ?? 'sheet-cmd');
  return `${functionName}() {
  local cur root subcommand
  cur="\${COMP_WORDS[COMP_CWORD]}"
  root="\${COMP_WORDS[1]}"
  subcommand="\${COMP_WORDS[2]}"
  COMPREPLY=()

  if [[ "$cur" == -* ]]; then
    COMPREPLY=($(compgen -W "${optionWords(globalOptions)}" -- "$cur"))
    return
  fi

  case "$COMP_CWORD" in
    1)
      COMPREPLY=($(compgen -W "${roots.map((item) => item.name).join(' ')}" -- "$cur"))
      ;;
    2)
      case "\${COMP_WORDS[1]}" in
${formatBashSubcommandCases(subcommands)}
      esac
      ;;
  esac
}

${binNames.map((binName) => `complete -F ${functionName} ${binName}`).join('\n')}`;
}

function formatBashSubcommandCases(groups: Map<string, CompletionGroup[]>) {
  return [...groups.entries()]
    .map(
      ([root, items]) => `        ${root})
          COMPREPLY=($(compgen -W "${items.map((item) => item.name).join(' ')}" -- "$cur"))
          ;;`
    )
    .join('\n');
}
