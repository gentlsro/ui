import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'
import process from 'node:process'
import { defineNuxtModule } from 'nuxt/kit'

import { ICON_ASSETS_BASE_URL, ICON_ASSETS_DIRECTORY_ENV } from './processor.ts'

const ONE_YEAR = 60 * 60 * 24 * 365

/**
 * Publishes the SVG files written by the UnoCSS icon processor under
 * `/_icons` for every app that extends this layer.
 */
export default defineNuxtModule({
  meta: { name: 'gentl-icon-assets' },
  setup(_, nuxt) {
    // Uno's client and SSR workers share this build's directory. A concurrent
    // prepare, dev server or build gets its own manifest and asset set.
    const parent = resolve(nuxt.options.buildDir, 'icon-assets')
    mkdirSync(parent, { recursive: true })
    const directory = mkdtempSync(resolve(parent, 'run-'))
    writeFileSync(resolve(directory, 'manifest.json'), '{}')
    process.env[ICON_ASSETS_DIRECTORY_ENV] = directory
    nuxt.options.runtimeConfig.public.uiIconEndpoint = (nuxt.options.icon && nuxt.options.icon.localApiEndpoint) || '/api/_nuxt_icon'

    nuxt.hook('close', () => {
      if (process.env[ICON_ASSETS_DIRECTORY_ENV] === directory) {
        delete process.env[ICON_ASSETS_DIRECTORY_ENV]
      }
      rmSync(directory, { recursive: true, force: true })
    })

    nuxt.hook('nitro:config', config => {
      config.publicAssets ??= []
      config.publicAssets.push({ dir: directory, baseURL: ICON_ASSETS_BASE_URL, maxAge: ONE_YEAR })
      // The index has a stable name; only the content-hashed SVGs are immutable.
      config.routeRules ??= {}
      config.routeRules[`${ICON_ASSETS_BASE_URL}/manifest.json`] = { headers: { 'cache-control': 'no-cache' } }
    })
  },
})
