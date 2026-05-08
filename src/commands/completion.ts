import type { Program as CaporalProgram } from '@caporal/core';
import { getBashCompletionScript } from '../cli/completion/bash';
import { getFishCompletionScript } from '../cli/completion/fish';
import {
  type CompletionGroup,
  type CompletionOption,
  getCompletionBinNames,
  getOptionGroups,
  getRootCommands,
  getSubcommandGroups,
  isVisibleCompletionCommand
} from '../cli/completion/shared';
import { getZshCompletionScript } from '../cli/completion/zsh';
import { defineCommand, defineSubCommand } from '../cli/define';
import { getProgramName } from '../config/constants';
import { Logger } from '../utils/logger';

enum CompletionShell {
  Bash = 'bash',
  Fish = 'fish',
  Zsh = 'zsh'
}

const completionShells = [CompletionShell.Zsh, CompletionShell.Bash, CompletionShell.Fish] as const;

export const completionCommand = defineCommand({
  name: 'completion',
  description: 'Generate shell completion scripts',
  subcommands: completionShells.map((shell) =>
    defineSubCommand({
      name: shell,
      description: `Generate ${shell} completion script`,
      action: async () => {}
    })
  )
});

const completionScriptGenerators = {
  [CompletionShell.Bash]: getBashCompletionScript,
  [CompletionShell.Fish]: getFishCompletionScript,
  [CompletionShell.Zsh]: getZshCompletionScript
} as const satisfies Record<
  CompletionShell,
  (
    binNames: string[],
    roots: CompletionGroup[],
    subcommands: Map<string, CompletionGroup[]>,
    options: Map<string, CompletionOption[]>
  ) => string
>;

export function createCompletionCommand(program: CaporalProgram): void {
  program.command(completionCommand.name, completionCommand.description).action(async () => {
    Logger.info(`Available shells: ${completionShells.join(', ')}`);
    Logger.info(`Usage: ${getProgramName()} completion <shell>`);
  });

  for (const shellCommand of completionCommand.subcommands) {
    program
      .command(`${completionCommand.name} ${shellCommand.name}`, shellCommand.description)
      .action(async ({ program }) => {
        if (!isCompletionShell(shellCommand.name)) {
          throw new Error(`Unsupported shell: ${shellCommand.name}`);
        }
        console.log(await getCompletionScript(program, shellCommand.name));
        return 0;
      });
  }
}

function isCompletionShell(value: string): value is CompletionShell {
  return (completionShells as readonly string[]).includes(value);
}

async function getCompletionScript(program: CaporalProgram, shell: CompletionShell) {
  const commands = (await program.getAllCommands()).filter(isVisibleCompletionCommand);
  const roots = getRootCommands(commands);
  const subcommands = getSubcommandGroups(commands);
  subcommands.set(
    completionCommand.name,
    completionShells.map((shell) => ({ name: shell, description: `Generate ${shell} completion` }))
  );
  const options = getOptionGroups(commands);
  return completionScriptGenerators[shell](getCompletionBinNames(program.getBin()), roots, subcommands, options);
}
