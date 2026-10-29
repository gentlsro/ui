import assert from 'node:assert/strict'
import { spawn } from 'node:child_process'
import { mkdir, writeFile } from 'node:fs/promises'
import { createWriteStream } from 'node:fs'
import { createRequire } from 'node:module'
import { dirname, join } from 'node:path'
import process from 'node:process'
import { fileURLToPath } from 'node:url'
import { chromium } from 'playwright-core'

const here = dirname(fileURLToPath(import.meta.url))
const require = createRequire(import.meta.url)
async function main() {
  const plain = process.argv.includes('--plain')
  const port = Number(process.env.UI_BUTTON_PORT ?? (plain ? 3115 : 3114))
  const url = process.env.UI_BUTTON_URL ?? `http://127.0.0.1:${port}`
  const artifacts = join(here, '../../test-results/button-classes', plain ? 'plain' : 'layered')
  await mkdir(artifacts, { recursive: true })

  const report = { url, assertions: [], browserErrors: [], result: 'running' }
  const serverLog = createWriteStream(join(artifacts, 'server.log'))
  const server = process.env.UI_BUTTON_URL
    ? undefined
    : spawn(process.execPath, [
        join(dirname(require.resolve('nuxt/package.json')), 'bin/nuxt.mjs'),
        'dev',
        '--host',
        '127.0.0.1',
        '--port',
        String(port),
      ], { cwd: join(here, plain ? 'fixture-plain' : 'fixture'), stdio: ['ignore', 'pipe', 'pipe'] })
  server?.stdout.pipe(serverLog)
  server?.stderr.pipe(serverLog)

  let browser
  let context
  let page

  try {
    const deadline = Date.now() + 180_000
    let html
    while (Date.now() < deadline) {
      if (server && server.exitCode !== null) {
        throw new Error(`Fixture server exited with ${server.exitCode}; see server.log`)
      }

      try {
        const response = await fetch(url, { signal: AbortSignal.timeout(10_000) })
        if (response.ok) {
          html = await response.text()
          break
        }
      } catch {
        // The owned dev server is still starting.
      }
      await new Promise(resolve => setTimeout(resolve, 500))
    }
    assert.ok(html, 'fixture server should become ready')
    await writeFile(join(artifacts, 'server-rendered.html'), html)
    assert.ok(html.includes(plain ? 'flex items-center tracking-wide relative select-none' : 'app-base theme-only app-sm'), 'SSR should use resolved slots')
    report.assertions.push(plain ? 'SSR retains builtin defaults without layer overrides' : 'SSR uses application base and nested size with inherited composer')

    browser = await chromium.launch({ channel: 'chrome', headless: true })
    context = await browser.newContext({ locale: 'en-US', viewport: { width: 1100, height: 700 } })
    await context.tracing.start({ screenshots: true, snapshots: true, sources: true })
    page = await context.newPage()
    page.on('pageerror', error => report.browserErrors.push(error.message))
    await page.goto(url)
    await page.getByTestId('hydrated').filter({ hasText: 'true' }).waitFor()

    const classList = async id => (await page.getByTestId(id).getAttribute('class')).split(/\s+/)
    const contains = async (id, expected) => {
      const actual = await classList(id)
      for (const value of expected) {
        assert.ok(actual.includes(value), `${id} is missing ${value}: ${actual.join(' ')}`)
      }

      return actual
    }

    if (plain) {
      report.initial = {
        plain: await contains('plain-button', ['flex', 'items-center', 'min-h-8', 'p-x-2.5']),
        picked: await contains('plain-picked-button', ['flex', 'items-center', 'font-semibold']),
      }
      assert.ok(!report.initial.plain.includes('app-base'))
      report.assertions.push('Standalone Button preserves builtin rendering and p()')
    } else {
      report.initial = {
        merged: await contains('merged-button', ['app-base', 'theme-only', 'app-sm']),
        independent: await contains('independent-button', ['app-base', 'theme-only', 'brand-lg']),
        picked: await contains('picked-button', ['app-base', 'theme-only', 'brand-only', 'app-only', 'app-sm']),
      }
      assert.ok(!report.initial.merged.includes('theme-base'))
      assert.ok(!report.initial.merged.includes('brand-base'))
      assert.ok(!report.initial.merged.includes('theme-sm'))
      report.assertions.push('Application overrides win; inherited layer slots remain available to p()')

      await page.getByTestId('size-toggle').click()
      await page.waitForFunction(() => document.querySelector('[data-testid="merged-button"]')?.classList.contains('brand-lg'))
      report.large = {
        merged: await contains('merged-button', ['app-base', 'theme-only', 'brand-lg']),
        independent: await classList('independent-button'),
      }
      assert.deepEqual(report.large.independent, report.initial.independent)
      assert.ok(!report.large.merged.includes('app-sm'))
      report.assertions.push('Reactive size recomposes classes and does not affect another instance')

      await page.getByTestId('size-toggle').click()
      await page.waitForFunction(() => document.querySelector('[data-testid="merged-button"]')?.classList.contains('app-sm'))
      assert.deepEqual(await classList('merged-button'), report.initial.merged)
      report.assertions.push('Returning to small size restores original merged classes')
    }
    assert.deepEqual(report.browserErrors, [])
    report.assertions.push('No browser runtime errors')
    report.result = 'passed'
    await page.screenshot({ path: join(artifacts, 'buttons.png'), fullPage: true })
    console.log(JSON.stringify(report, null, 2))
  } catch (error) {
    report.result = 'failed'
    report.error = error instanceof Error ? error.stack : String(error)
    if (page) {
      await page.screenshot({ path: join(artifacts, 'failure.png'), fullPage: true })
    }
    throw error
  } finally {
    await writeFile(join(artifacts, 'result.json'), `${JSON.stringify(report, null, 2)}\n`)
    if (context) {
      await context.tracing.stop({ path: join(artifacts, 'trace.zip') })
    }
    await browser?.close()
    server?.kill('SIGTERM')
    serverLog.end()
  }
}

main().catch(error => {
  console.error(error)
  process.exitCode = 1
})
