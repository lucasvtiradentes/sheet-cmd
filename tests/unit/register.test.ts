import { createRequire } from 'node:module';
import type { Program as CaporalProgram } from '@caporal/core';
import { describe, expect, it } from 'vitest';
import { defineSubCommand, flag } from '../../src/cli/define';
import { registerProgram } from '../../src/cli/register';

describe('registerProgram', () => {
  it('registers --no-* flags with true default and false when passed', async () => {
    const withoutFlag = await runWriteCommand(['write']);
    const withFlag = await runWriteCommand(['write', '--no-preserve']);

    expect(withoutFlag).toEqual({ preserve: true });
    expect(withFlag).toEqual({ preserve: false });
  });
});

async function runWriteCommand(argv: string[]) {
  let receivedOptions: unknown;

  const command = defineSubCommand({
    name: 'write',
    description: 'Write',
    flags: [flag.boolean('--no-preserve', 'Overwrite cells with formulas or data validation')],
    action: ({ options }) => {
      receivedOptions = options;
    }
  });

  const program = new (getProgramConstructor())().bin('test').name('test').version('1.0.0');
  registerProgram(program, [command]);

  await program.run(argv);
  return receivedOptions;
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
