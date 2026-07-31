import { defineConfig } from 'vitest/config'
import path from 'path'

export default defineConfig({
  test: {
    environment: 'node',
    globals: true,
    setupFiles: './tests/setup.ts',
    testTimeout: 15000,
    hookTimeout: 30000,
    pool: 'forks',
    sequence: { concurrent: false },
    exclude: ['tests/e2e/**', 'tests/global-setup.ts', 'node_modules/**', 'dist/**', '.next/**'],
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, '.'),
    },
  },
})
