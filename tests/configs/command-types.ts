import { argument, flag } from '../../src/cli/define';
import type { InferArgs, InferOptions } from '../../src/cli/types';

const flags = [
  flag.string('--new-name', 'New name', { required: true }),
  flag.boolean('--skip-header', 'Skip header'),
  flag.boolean('--no-preserve', 'Do not preserve'),
  flag.string('--output', 'Output', { alias: '-o' })
] as const;

const args = [argument.string('email', 'Email'), argument.string('row-name', 'Row name', { required: true })] as const;

type ExpectedOptions = {
  newName: string;
  skipHeader?: boolean;
  preserve?: boolean;
  output?: string;
};

type ExpectedArgs = {
  email?: string;
  rowName: string;
};

const optionsTypeCheck: Expect<Equal<InferOptions<typeof flags>, ExpectedOptions>> = true;
const argsTypeCheck: Expect<Equal<InferArgs<typeof args>, ExpectedArgs>> = true;

void optionsTypeCheck;
void argsTypeCheck;

type Expect<T extends true> = T;

type Equal<Left, Right> = (<Type>() => Type extends Left ? 1 : 2) extends <Type>() => Type extends Right ? 1 : 2
  ? true
  : false;
