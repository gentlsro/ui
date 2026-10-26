import { mkdirSync, readdirSync, readFileSync, rmSync } from 'node:fs'
import { resolve } from 'node:path'
import process from 'node:process'
import { defineNuxtModule } from 'nuxt/kit'

import { ICON_ASSETS_BASE_URL, ICON_ASSETS_DIRECTORY_ENV, updateIconManifest } from './processor.ts'

const ONE_YEAR = 60 * 60 * 24 * 365

/**
 * Publishes the SVG files written by the UnoCSS icon processor under
 * `/_icons` for every app that extends this layer.
 */
export default defineNuxtModule({
  meta: { name: 'gentl-icon-assets' },
  setup(_, nuxt) {
    const directory = resolve(nuxt.options.buildDir, 'icon-assets')
    mkdirSync(directory, { recursive: true })
    updateIconManifest({ directory, update: () => ({}), reset: true })
    process.env[ICON_ASSETS_DIRECTORY_ENV] = directory
    nuxt.options.runtimeConfig.public.uiIconEndpoint = (nuxt.options.icon && nuxt.options.icon.localApiEndpoint) || '/api/_nuxt_icon'
    nuxt.hook('nitro:build:before', () => {
      // Prune after Uno has finished collecting both client/SSR icons. Prepare
      // and typecheck must not delete assets still served by a dev process.
      const manifest: Record<string, { url: string }> = JSON.parse(readFileSync(resolve(directory, 'manifest.json'), 'utf8'))
      const current = new Set(Object.values(manifest).map(asset => asset.url.split('/').at(-1)))
      for (const file of readdirSync(directory)) {
        if (file.endsWith('.svg') && !current.has(file)) {
          rmSync(resolve(directory, file))
        }
      }
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
