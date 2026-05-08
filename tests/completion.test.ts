import { execSync } from 'node:child_process';
import { dirname, resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const CLI_ROOT = resolve(dirname(new URL(import.meta.url).pathname), '..');
const CLI_PATH = resolve(CLI_ROOT, 'src/cli.ts');

function runCli(args: string[], binName = 'gsheet') {
  return execSync(`npx tsx ${CLI_PATH} ${args.join(' ')}`, {
    cwd: CLI_ROOT,
    encoding: 'utf-8',
    env: { ...process.env, SHEET_CMD_PROG_NAME: binName },
    timeout: 30_000
  });
}

describe('completion', () => {
  it.each(['zsh', 'bash', 'fish'])('generates %s completion', (shell) => {
    const output = runCli(['completion', shell]);

    expect(output).toContain('gsheet');
    expect(output).toContain('gs');
    expect(output).toContain('account');
    expect(output).toContain('spreadsheet');
    expect(output).toContain('sheet');
    expect(output).toContain('completion');
  });

  it('binds zsh completion to stable bins only', () => {
    const output = runCli(['completion', 'zsh'], 'gs');

    expect(output).toContain('#compdef gs gsheet');
    expect(output).toContain('compdef _gs_completion gs gsheet');
    expect(output).not.toContain('gsd');
  });

  it('binds zsh dev completion to dev bins only', () => {
    const output = runCli(['completion', 'zsh'], 'gsd');

    expect(output).toContain('#compdef gsd gsheetd');
    expect(output).toContain('compdef _gsd_completion gsd gsheetd');
    expect(output).not.toContain('compdef _gsd_completion gs ');
    expect(output).not.toContain('compdef _gsd_completion gsheet ');
  });

  it('binds bash dev completion to dev bins only', () => {
    const output = runCli(['completion', 'bash'], 'gsd');

    expect(output).toContain('complete -F _gsd_completion gsd');
    expect(output).toContain('complete -F _gsd_completion gsheetd');
    expect(output).not.toContain('complete -F _gsd_completion gs\n');
    expect(output).not.toContain('complete -F _gsd_completion gsheet\n');
  });

  it('binds fish dev completion to dev bins only', () => {
    const output = runCli(['completion', 'fish'], 'gsd');

    expect(output).toContain('complete -c gsd -f');
    expect(output).toContain('complete -c gsheetd -f');
    expect(output).not.toContain('complete -c gs -f');
    expect(output).not.toContain('complete -c gsheet -f\n');
  });
});
