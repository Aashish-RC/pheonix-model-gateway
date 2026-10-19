import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: ['tests/**/*.test.ts'],
    exclude: ['quarantine/**/*', 'packages-pending/**/*', 'node_modules', 'dist'],
    setupFiles: ['./tests/setup.ts']
  }
});
