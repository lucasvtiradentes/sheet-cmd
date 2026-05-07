import { rmSync } from 'node:fs';
import { join } from 'node:path';
import { devBinNames, getDevBinDir } from './dev-bin';

const binDir = getDevBinDir();

for (const binName of devBinNames) {
  rmSync(join(binDir, binName), { force: true });
  rmSync(join(binDir, `${binName}.cmd`), { force: true });
}
