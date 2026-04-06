import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: ['tests/e2e/**/*.test.js'],
    environment: 'node',
    testTimeout: 30000,
    globals: true,
    maxWorkers: 1,
    minWorkers: 1,
    reporter: 'verbose',
  },
});
