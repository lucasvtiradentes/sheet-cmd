#!/usr/bin/env node

import { realpathSync } from 'node:fs';
import { createRequire } from 'node:module';
import { basename } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import type { Program as CaporalProgram } from '@caporal/core';

import { cliCommands } from './cli/catalog';
import { registerProgram } from './cli/register';
import { createCompletionCommand } from './commands/completion';
import { APP_INFO, getProgramName } from './config/constants';

const program = createProgram(getProgramBin());

registerProgram(program, cliCommands);
createCompletionCommand(program);

try {
  await program.run(process.argv.slice(2).length === 0 ? ['--help'] : process.argv.slice(2));
} catch (error) {
  const message = error instanceof Error ? error.message : String(error);
  console.log(`error: ${message}`);
  process.exitCode = 1;
}

function createProgram(binName: string): CaporalProgram {
  return new (getProgramConstructor())()
    .bin(binName)
    .name(binName)
    .description('Google Sheets CLI - A tool to interact with Google Sheets')
    .version(APP_INFO.version)
    .disableGlobalOption('--no-color')
    .disableGlobalOption('--quiet')
    .disableGlobalOption('--silent')
    .disableGlobalOption('-v');
}

function getProgramConstructor() {
  const require = createRequire(import.meta.url);
  const module = require('@caporal/core') as {
    Program?: new () => CaporalProgram;
    default?: { Program?: new () => CaporalProgram };
  };
  const Program = module.Program ?? module.default?.Program;
  if (!Program) throw new Error('Caporal Program constructor not found');
  return Program;
}

function getProgramBin() {
  if (process.env.SHEET_CMD_PROG_NAME) return getProgramName();
  if (isDirectRun() && process.argv[1]) return basename(process.argv[1]);
  return APP_INFO.name;
}

function isDirectRun() {
  if (!process.argv[1]) return false;

  try {
    return realpathSync(process.argv[1]) === realpathSync(fileURLToPath(import.meta.url));
  } catch {
    return import.meta.url === pathToFileURL(process.argv[1]).href;
  }
}
