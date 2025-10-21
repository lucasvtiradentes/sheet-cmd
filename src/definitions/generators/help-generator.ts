import chalk from 'chalk';
import { APP_INFO, GOOGLE_CLOUD_CONSOLE_URLS } from '../../config/constants.js';
import { COMMANDS_SCHEMA } from '../commands.js';
import type { Command, SubCommand } from '../types.js';

function formatFlag(flag: { name: string; description?: string; type?: string }): string {
  if (flag.name.startsWith('--') || flag.name.startsWith('-')) {
    return `      ${flag.name.padEnd(25)} ${flag.description || ''}`;
  }
  return `    ${flag.name.padEnd(27)} ${flag.description || ''}`;
}

function formatSubCommand(sub: SubCommand, indent = 4): string {
  const spaces = ' '.repeat(indent);

  let commandName = sub.name;
  if (sub.arguments && sub.arguments.length > 0) {
    const argStrings = sub.arguments.map((arg) => (arg.required ? `<${arg.name}>` : `[${arg.name}]`));
    commandName = `${sub.name} ${argStrings.join(' ')}`;
  }

  let output = `${spaces}${commandName.padEnd(27 - indent)} ${sub.description}`;

  if (sub.arguments && sub.arguments.length > 1) {
    for (const arg of sub.arguments) {
      output += `\n${formatFlag({ name: arg.name, description: arg.description, type: arg.type })}`;
    }
  }

  if (sub.flags && sub.flags.length > 0) {
    for (const flag of sub.flags) {
      output += `\n${formatFlag(flag)}`;
    }
  }

  return output;
}

function formatCommand(cmd: Command): string {
  if (cmd.subcommands && cmd.subcommands.length > 0) {
    let output = `  ${chalk.yellow(cmd.name)}\n`;
    for (const sub of cmd.subcommands) {
      output += `${formatSubCommand(sub)}\n`;
    }
    return output;
  } else {
    return `  ${chalk.yellow(cmd.name.padEnd(25))} ${cmd.description}\n`;
  }
}

function generateExamplesSection(): string {
  const examples: string[] = [];

  for (const cmd of COMMANDS_SCHEMA) {
    if (cmd.examples && cmd.examples.length > 0) {
      examples.push(...cmd.examples);
    }

    if (cmd.subcommands) {
      for (const sub of cmd.subcommands) {
        if (sub.examples && sub.examples.length > 0) {
          examples.push(...sub.examples.slice(0, 1));
        }
      }
    }
  }

  const limitedExamples = examples.slice(0, 12);

  return limitedExamples.map((ex) => `  ${chalk.cyan(`$ ${ex}`)}`).join('\n');
}

export function generateHelp(): string {
  const commandsSection = COMMANDS_SCHEMA.map((cmd) => formatCommand(cmd)).join('\n');
  const examplesSection = generateExamplesSection();

  return `
${chalk.bold('USAGE')}
  ${chalk.cyan(`$ ${APP_INFO.name}`)} ${chalk.yellow('<command>')} ${chalk.gray('[options]')}

${chalk.bold('COMMANDS')}
${commandsSection}
${chalk.bold('EXAMPLES')}
${examplesSection}

${chalk.bold('GETTING STARTED')}
  1. Setup Google Cloud Console:
     → Go to: ${GOOGLE_CLOUD_CONSOLE_URLS.CREDENTIALS}
     → Enable Google Sheets API
     → Configure OAuth Consent Screen (External, add test users)
     → Create OAuth 2.0 Client ID (Desktop app type)

  2. Add your first account:
     → ${APP_INFO.name} account add
     → Enter Client ID and Secret from step 1
     → Browser will open for authentication

  3. Add a spreadsheet:
     → ${APP_INFO.name} spreadsheet add

  4. Start using sheet operations:
     → ${APP_INFO.name} sheet list

${chalk.dim('TIP: Use tab completion for easier navigation (sheet-cmd completion install)')}
  `;
}
