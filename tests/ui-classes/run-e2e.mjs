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
  const catalog = process.argv.includes('--catalog')
  const port = Number(process.env.UI_CLASSES_PORT ?? (catalog ? 3117 : 3116))
  const url = process.env.UI_CLASSES_URL ?? `http://127.0.0.1:${port}`
  const artifacts = join(here, '../../test-results/ui-classes', catalog ? 'catalog' : 'representative')
  await mkdir(artifacts, { recursive: true })

  const report = { url, assertions: [], browserErrors: [], result: 'running' }
  const serverLog = createWriteStream(join(artifacts, 'server.log'))
  const server = process.env.UI_CLASSES_URL
    ? undefined
    : spawn(process.execPath, [
        join(dirname(require.resolve('nuxt/package.json')), 'bin/nuxt.mjs'),
        'dev',
        '--host',
        '127.0.0.1',
        '--port',
        String(port),
      ], { cwd: join(here, catalog ? 'generated-fixture' : 'fixture'), stdio: ['ignore', 'pipe', 'pipe'] })
  server?.stdout.pipe(serverLog)
  server?.stderr.pipe(serverLog)

  let browser
  let context
  let page
  let serverCatalog
  let serverHelpers

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
    if (catalog) {
      const encoded = html.match(/<pre[^>]*data-testid="catalog-results"[^>]*>([\s\S]*?)<\/pre>/)?.[1]
      assert.ok(encoded, 'SSR should include the complete class catalog')
      const entities = { '&amp;': '&', '&quot;': '"', '&lt;': '<', '&gt;': '>', '&#39;': "'" }
      serverCatalog = JSON.parse(encoded.replace(/&(?:amp|quot|lt|gt|#39);/g, entity => entities[entity]))
      report.assertions.push('SSR evaluates the actual component resolver catalog')
    } else {
      assert.ok(html.includes('badge-app'), 'SSR should resolve static component overrides')
      assert.ok(html.includes('checkbox-app-sm'), 'SSR should resolve nested dynamic defaults')
      assert.ok(html.includes('input-app'), 'SSR should resolve inherited InputWrapper defaults')
      report.assertions.push('SSR includes merged static, dynamic, and inherited defaults')
      const encoded = html.match(/<pre[^>]*data-testid="helper-results"[^>]*>([\s\S]*?)<\/pre>/)?.[1]
      assert.ok(encoded, 'SSR should evaluate the component prop helpers')
      const entities = { '&amp;': '&', '&quot;': '"', '&lt;': '<', '&gt;': '>', '&#39;': "'" }
      serverHelpers = JSON.parse(encoded.replace(/&(?:amp|quot|lt|gt|#39);/g, entity => entities[entity]))
    }

    browser = await chromium.launch({ channel: 'chrome', headless: true })
    context = await browser.newContext({ locale: 'en-US', viewport: { width: 1100, height: 700 } })
    await context.tracing.start({ screenshots: true, snapshots: true, sources: true })
    page = await context.newPage()
    page.on('pageerror', error => report.browserErrors.push(error.message))
    await page.goto(url)
    await page.getByTestId('hydrated').filter({ hasText: 'true' }).waitFor()

    if (catalog) {
      const results = JSON.parse(await page.getByTestId('catalog-results').textContent())
      assert.equal(results.length, 251)
      assert.equal(new Set(results.map(row => row.component)).size, 58)
      assert.deepEqual(results, serverCatalog, 'Server and browser resolver output must agree')
      for (const row of results) {
        assert.equal(row.winner, `app-${row.component}-${row.surface}`)
        assert.equal(row.picked, row.winner)
        assert.equal(row.theme, 'theme-only')
        assert.equal(row.brand, 'brand-only')
        assert.equal(typeof row.all, 'string')
      }
      report.catalog = results
      report.assertions.push('All 251 resolver surfaces preserve layer order, added picker keys, and string all output')
      await writeFile(join(artifacts, 'catalog.json'), `${JSON.stringify(results, null, 2)}\n`)
    } else {
      const helpers = JSON.parse(await page.getByTestId('helper-results').textContent())
      assert.deepEqual(helpers, serverHelpers, 'Server and browser prop helper output must agree')
      assert.deepEqual(helpers.defaults, {
        objectFactory: true,
        arrayFactory: true,
        callbackPreserved: true,
        callbackResult: 'helper:value',
        tableCallbackResult: true,
      })
      assert.deepEqual(helpers.merged, {
        keys: ['ui'],
        base: 'helper-override',
        retained: 'helper-retained',
        nested: { winner: 'override' },
        callbackPreserved: true,
        unchangedDefaults: true,
        unchangedOverrides: true,
      })
      assert.deepEqual(helpers.missingDefaults, { tooltip: 'optional-tooltip', button: 'optional-button' })
      assert.deepEqual(helpers.emptyMergeKeys, [])
      assert.equal(helpers.optionalMergeAbsent, true)
      report.helpers = helpers
      report.assertions.push('Prop defaults preserve Vue factories and callable values in SSR and Chrome')
      report.assertions.push('Selected nested props merge shallowly without mutation, including missing optional defaults and extension keys')
      await writeFile(join(artifacts, 'helpers.json'), `${JSON.stringify(helpers, null, 2)}\n`)

      const classList = async id => (await page.getByTestId(id).getAttribute('class')).split(/\s+/)
      const contains = async (id, expected) => {
        const actual = await classList(id)
        for (const value of expected) {
          assert.ok(actual.includes(value), `${id} is missing ${value}: ${actual.join(' ')}`)
        }

        return actual
      }

      const subtreeClasses = async id => page.getByTestId(id).evaluate(element =>
        [element, ...element.querySelectorAll('*')].flatMap(node => [...node.classList]))
      const containsSubtree = async (id, expected) => {
        const actual = await subtreeClasses(id)
        for (const value of expected) {
          assert.ok(actual.includes(value), `${id} is missing ${value}`)
        }

        return actual
      }

      report.initial = {
        badge: await contains('badge-default', ['badge-app']),
        pickedBadge: await contains('badge-picked', ['badge-app', 'theme-badge', 'brand-badge', 'app-badge', 'explicit-top-right']),
        section: await contains('section', ['section-app', 'theme-section', 'brand-section', 'app-section']),
        checkbox: await contains('checkbox', ['checkbox-app', 'checkbox-app-sm']),
        toggle: await containsSubtree('toggle', ['toggle-app', 'toggle-app-sm']),
        day: await contains('date-day', ['day-idle']),
        input: await contains('text-wrapper', ['input-app', 'theme-input', 'brand-input', 'app-input']),
        list: await contains('list', ['list-app', 'theme-list', 'brand-list', 'app-list']),
        button: await contains('button-regression', ['button-app', 'theme-button', 'brand-button', 'app-button']),
      }
      assert.ok(!report.initial.pickedBadge.includes('badge-theme'))
      assert.ok(!report.initial.pickedBadge.includes('badge-brand'))
      assert.equal(await page.getByTestId('badge-default').evaluate(el => getComputedStyle(el).opacity), '0.75')
      report.assertions.push('Static overrides, derived Badge.inline, p() keys, and legacy style callback agree')

      await page.getByTestId('size-toggle').click()
      await page.waitForFunction(() => document.querySelector('[data-testid="checkbox"]')?.classList.contains('checkbox-brand-lg'))
      report.large = {
        checkbox: await contains('checkbox', ['checkbox-brand-lg']),
        toggle: await containsSubtree('toggle', ['toggle-brand-lg']),
      }
      assert.ok(!report.large.checkbox.includes('checkbox-app-sm'))
      await page.getByTestId('size-toggle').click()
      await page.waitForFunction(() => document.querySelector('[data-testid="checkbox"]')?.classList.contains('checkbox-app-sm'))
      await page.getByTestId('contained-toggle').click()
      await containsSubtree('toggle', ['toggle-brand-contained'])
      report.assertions.push('Nested sizes and Toggle.size recompute for reactive size and contained state')

      await page.getByTestId('date-toggle').click()
      await page.waitForFunction(() => document.querySelector('[data-testid="date-day"]')?.classList.contains('day-selected'))
      report.selectedDay = await contains('date-day', ['day-selected', 'app-selected'])
      assert.ok(!report.selectedDay.includes('day-idle'))
      report.assertions.push('Nested DatePicker day payload reaches layer callbacks reactively')

      await page.getByTestId('text-control').fill('Edited')
      await page.getByTestId('text-value').filter({ hasText: 'Edited' }).waitFor()
      report.assertions.push('InputWrapper overrides reach a real editable TextInput')

      await page.getByTestId('selector-open').click()
      await page.getByTestId('selector-list').waitFor()
      report.selectorList = await contains('selector-list', ['list-app', 'theme-list', 'brand-list', 'app-list'])
      report.assertions.push('Selector nested List callback receives the same resolved defaults')
    }

    assert.deepEqual(report.browserErrors, [])
    report.assertions.push('No browser runtime errors')
    report.result = 'passed'
    await page.screenshot({ path: join(artifacts, 'components.png'), fullPage: !catalog })
    console.log(JSON.stringify(report, null, 2))
  } catch (error) {
    report.result = 'failed'
    report.error = error instanceof Error ? error.stack : String(error)
    if (page) {
      await writeFile(join(artifacts, 'failure.html'), await page.content())
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
