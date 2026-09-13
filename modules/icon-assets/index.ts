import { mkdirSync } from 'node:fs'
import { resolve } from 'node:path'
import process from 'node:process'
import { defineNuxtModule } from 'nuxt/kit'

import { ICON_ASSETS_BASE_URL, ICON_ASSETS_DIRECTORY_ENV } from './processor'

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
    process.env[ICON_ASSETS_DIRECTORY_ENV] = directory

    nuxt.hook('nitro:config', config => {
      config.publicAssets ??= []
      config.publicAssets.push({ dir: directory, baseURL: ICON_ASSETS_BASE_URL, maxAge: ONE_YEAR })
    })
  },
})
