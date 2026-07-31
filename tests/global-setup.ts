import { execSync } from 'child_process'

/**
 * Seed the database before the E2E suite runs.
 * The seed is deterministic (demo@projecthub.dev / demo1234, 3 projects, 5 tasks),
 * so every run starts from a known state.
 */
export default function globalSetup(): void {
  execSync('node node_modules/tsx/dist/cli.mjs prisma/seed.ts', {
    stdio: 'inherit',
  })
}
