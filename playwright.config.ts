import { defineConfig } from '@playwright/test'

export default defineConfig({
  testDir: './tests/e2e',
  timeout: 30000,
  retries: 1,
  globalSetup: './tests/global-setup.ts',
  webServer: {
    command: 'node node_modules/next/dist/bin/next dev -p 3456',
    url: 'http://localhost:3456',
    reuseExistingServer: true,
    timeout: 180000,
  },
  use: {
    baseURL: 'http://localhost:3456',
    headless: true,
    viewport: { width: 1440, height: 900 },
  },
})
