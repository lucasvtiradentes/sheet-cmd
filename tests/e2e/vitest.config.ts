import path from 'path';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  resolve: {
    alias: {
      '@': path.resolve(__dirname, '../../src')
    }
  },
  test: {
    name: 'e2e',
    globals: true,
    environment: 'node',
    include: ['tests/e2e/**/*.e2e.test.ts'],
    setupFiles: [path.resolve(__dirname, './setup.ts')],
    globalSetup: [path.resolve(__dirname, './globalSetup.ts')],
    testTimeout: 60000, // 1 minute for API calls
    env: {
      NODE_ENV: 'e2e'
    },
    pool: 'threads',
    poolOptions: {
      threads: {
        singleThread: true
      }
    }
  }
});
