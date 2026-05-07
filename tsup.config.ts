import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/cli.ts'],
  format: ['esm'],
  target: 'es2022',
  platform: 'node',
  dts: true,
  sourcemap: true,
  clean: true,
  splitting: false
});
