import process from 'node:process'
import { fileURLToPath } from 'node:url'
import { defineConfig, devices } from '@playwright/test'
import type { ConfigOptions } from '@nuxt/test-utils/playwright'

const isCI = !!process.env.CI
const port = Number(process.env.E2E_PORT ?? 3111)
const host = `http://localhost:${port}/`
const fixtureDir = fileURLToPath(new URL('./e2e/fixtures/app', import.meta.url))

export default defineConfig<ConfigOptions>({
  testDir: './e2e',
  // `.e2e.ts` so the root vitest run (default include `**/*.{test,spec}.?(c|m)[jt]s?(x)`) never sees these
  testMatch: '**/*.e2e.ts',
  fullyParallel: true,
  forbidOnly: isCI,
  retries: isCI ? 2 : 0,
  workers: isCI ? 1 : undefined,
  reporter: isCI ? [['list'], ['html', { open: 'never' }]] : [['list']],
  timeout: 60_000,
  expect: { timeout: 10_000 },

  use: {
    // `host` makes @nuxt/test-utils skip its per-worker build/server and only provide `goto()` with hydration waiting.
    // Do not set `baseURL` here - the Nuxt fixture overrides it with `host`.
    nuxt: {
      host,
      rootDir: fixtureDir,
    },
    // The UI layer uses i18n `prefix_and_default` with browser-language detection; pin the locale so a
    // non-English system locale does not redirect `/btn` to `/cs-CZ/btn`.
    locale: 'en-US',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },

  // One server for all projects/workers. The scripts `cd` into the fixture dir, which matters because
  // @unocss/nuxt loads the app's uno.config from process.cwd().
  webServer: {
    command: isCI
      ? 'bun run e2e:build && bun run e2e:start'
      : 'bun run e2e:dev',
    url: host,
    reuseExistingServer: !isCI,
    timeout: 240_000,
    env: {
      NUXT_PORT: String(port),
      NITRO_PORT: String(port),
      PORT: String(port),
    },
    stdout: process.env.E2E_DEBUG ? 'pipe' : 'ignore',
    stderr: 'pipe',
  },

  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
    { name: 'webkit', use: { ...devices['Desktop Safari'] } },
  ],
})
