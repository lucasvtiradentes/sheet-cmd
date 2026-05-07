#!/usr/bin/env tsx

import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { COMMANDS_SCHEMA } from '../src/definitions/commands';
import { generateBashCompletion, generateZshCompletion } from '../src/definitions/generators/completion-generator';
import { generateHelp } from '../src/definitions/generators/help-generator';
import { generateReadmeSections } from '../src/definitions/generators/readme-generator';

const ROOT_DIR = process.cwd();
const README_PATH = join(ROOT_DIR, 'README.md');
const COMPLETIONS_DIR = join(ROOT_DIR, 'completions');
const HELP_FILE = join(ROOT_DIR, 'docs', 'help.txt');

function validateSchema(): boolean {
  console.log('🔍 Validating commands schema...\n');

  let hasErrors = false;

  for (const cmd of COMMANDS_SCHEMA) {
    if (!cmd.name) {
      console.error(`❌ Command missing name`);
      hasErrors = true;
    }
    if (!cmd.description) {
      console.error(`❌ Command "${cmd.name}" missing description`);
      hasErrors = true;
    }

    if (cmd.subcommands) {
      for (const sub of cmd.subcommands) {
        if (!sub.name) {
          console.error(`❌ Subcommand in "${cmd.name}" missing name`);
          hasErrors = true;
        }
        if (!sub.description) {
          console.error(`❌ Subcommand "${cmd.name} ${sub.name}" missing description`);
          hasErrors = true;
        }

        if (sub.flags) {
          for (const flag of sub.flags) {
            if (!flag.name) {
              console.error(`❌ Flag in "${cmd.name} ${sub.name}" missing name`);
              hasErrors = true;
            }
            if (!flag.type) {
              console.error(`❌ Flag "${flag.name}" in "${cmd.name} ${sub.name}" missing type`);
              hasErrors = true;
            }
          }
        }
      }
    }

    if (cmd.flags) {
      for (const flag of cmd.flags) {
        if (!flag.name) {
          console.error(`❌ Flag in "${cmd.name}" missing name`);
          hasErrors = true;
        }
        if (!flag.type) {
          console.error(`❌ Flag "${flag.name}" in "${cmd.name}" missing type`);
          hasErrors = true;
        }
      }
    }
  }

  if (hasErrors) {
    console.error('\n❌ Schema validation failed\n');
    return false;
  }

  console.log('✅ Schema validation passed\n');
  return true;
}

function generateCompletionScripts(): void {
  console.log('📝 Generating shell completion scripts...\n');

  if (!existsSync(COMPLETIONS_DIR)) {
    mkdirSync(COMPLETIONS_DIR, { recursive: true });
  }

  const zshScript = generateZshCompletion();
  const zshPath = join(COMPLETIONS_DIR, '_sheet-cmd');
  writeFileSync(zshPath, zshScript, 'utf-8');
  console.log(`  ✅ Zsh completion: completions/_sheet-cmd`);

  const bashScript = generateBashCompletion();
  const bashPath = join(COMPLETIONS_DIR, 'sheet-cmd.bash');
  writeFileSync(bashPath, bashScript, 'utf-8');
  console.log(`  ✅ Bash completion: completions/sheet-cmd.bash`);

  console.log();
}

function generateHelpText(): void {
  console.log('📝 Generating help text...\n');

  const docsDir = join(ROOT_DIR, 'docs');
  if (!existsSync(docsDir)) {
    mkdirSync(docsDir, { recursive: true });
  }

  const helpText = generateHelp();
  const plainHelpText = helpText.replace(
    // biome-ignore lint/suspicious/noControlCharactersInRegex: needed for ANSI codes
    /[\u001b\u009b][[()#;?]*(?:[0-9]{1,4}(?:;[0-9]{0,4})*)?[0-9A-ORZcf-nqry=><]/g,
    ''
  );

  writeFileSync(HELP_FILE, plainHelpText, 'utf-8');
  console.log(`  ✅ Help text: docs/help.txt`);
  console.log();
}

function updateReadme(): void {
  console.log('📝 Updating README.md with generated content...\n');

  if (!existsSync(README_PATH)) {
    console.error('  ❌ README.md not found');
    return;
  }

  const readme = readFileSync(README_PATH, 'utf-8');
  const sections = generateReadmeSections();

  let updatedReadme = readme;

  const markers: Record<string, string> = {
    '<!-- BEGIN:COMMANDS -->': sections.commands || ''
  };

  let sectionsUpdated = 0;

  for (const [beginMarker, content] of Object.entries(markers)) {
    const endMarker = beginMarker.replace('BEGIN:', 'END:');
    const regex = new RegExp(`${escapeRegex(beginMarker)}[\\s\\S]*?${escapeRegex(endMarker)}`, 'g');

    if (regex.test(updatedReadme)) {
      updatedReadme = updatedReadme.replace(regex, `${beginMarker}\n${content}\n${endMarker}`);
      console.log(`  ✅ Updated: ${beginMarker.replace('<!-- BEGIN:', '').replace(' -->', '')}`);
      sectionsUpdated++;
    } else {
      console.log(`  ⚠️  Marker not found: ${beginMarker.replace('<!-- BEGIN:', '').replace(' -->', '')}`);
    }
  }

  writeFileSync(README_PATH, updatedReadme, 'utf-8');
  console.log(`\n  📄 ${sectionsUpdated}/${Object.keys(markers).length} sections updated in README.md`);
  console.log();
}

function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function printSummary(): void {
  console.log('═'.repeat(60));
  console.log('📊 SUMMARY');
  console.log('═'.repeat(60));
  console.log();
  console.log('Generated files:');
  console.log('  • completions/_sheet-cmd        (Zsh completion)');
  console.log('  • completions/sheet-cmd.bash    (Bash completion)');
  console.log('  • docs/help.txt                 (Help reference)');
  console.log('  • README.md                     (Updated command sections)');
  console.log();
  console.log('✨ All command documentation updated successfully!');
  console.log();
  console.log('Next steps:');
  console.log('  1. Test completions: source completions/sheet-cmd.bash');
  console.log('  2. Commit the generated files if everything looks good');
  console.log();
}

function main(): void {
  console.log();
  console.log('═'.repeat(60));
  console.log('🔄 UPDATE COMMANDS DOCUMENTATION');
  console.log('═'.repeat(60));
  console.log();

  if (!validateSchema()) {
    process.exit(1);
  }

  try {
    generateCompletionScripts();
  } catch (error) {
    console.error('❌ Failed to generate completion scripts:', error);
    process.exit(1);
  }

  try {
    generateHelpText();
  } catch (error) {
    console.error('❌ Failed to generate help text:', error);
    process.exit(1);
  }

  try {
    updateReadme();
  } catch (error) {
    console.error('❌ Failed to update README:', error);
    process.exit(1);
  }

  printSummary();
}

main();
