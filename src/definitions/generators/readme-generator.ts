import { COMMANDS_SCHEMA } from '../commands.js';

function generateAllCommands(): string {
  let output = '';

  for (const cmd of COMMANDS_SCHEMA) {
    if (!cmd.subcommands || cmd.subcommands.length === 0) {
      if (cmd.examples && cmd.examples.length > 0) {
        output += `### ${cmd.name.charAt(0).toUpperCase() + cmd.name.slice(1)}\n\n`;
        output += `${cmd.description}\n\n`;
        output += '```bash\n';
        output += `${cmd.examples[0]}\n`;
        output += '```\n\n';
      }
      continue;
    }

    output += `### ${cmd.name.charAt(0).toUpperCase() + cmd.name.slice(1)} Commands\n\n`;

    for (const sub of cmd.subcommands) {
      if (!sub.examples || sub.examples.length === 0) continue;

      output += `**${sub.name}** - ${sub.description}\n\n`;
      output += '```bash\n';
      output += `${sub.examples[0]}\n`;
      output += '```\n\n';
    }
  }

  return output;
}

export function generateReadmeSections() {
  return {
    commands: generateAllCommands()
  };
}
