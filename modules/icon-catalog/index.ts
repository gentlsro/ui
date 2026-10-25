import { readFile } from 'node:fs/promises'
import { createRequire } from 'node:module'
import { join } from 'node:path'
import { addServerHandler, addServerTemplate, addTypeTemplate, createResolver, defineNuxtModule, logger } from 'nuxt/kit'

import type { IconCatalog } from './runtime/icon-catalog-search'

export const ICON_CATALOG_TEMPLATE = '#gentl-icon-catalog'

// The part of an `@iconify-json/*` `icons.json` the index reads
type IconSetJson = {
  icons: Record<string, { hidden?: boolean }>
  aliases?: Record<string, unknown>
}

/**
 * Publishes `/_ui/icons/search` for every app that extends this layer.
 *
 * The search runs over a name index built here from the same `@iconify-json/*` packages the server
 * renders from (`icon.serverBundle.collections`), so every result renders and nothing depends on the
 * Iconify API. The index is a server-only template; no icon data reaches the client.
 */
export default defineNuxtModule({
  meta: { name: 'gentl-icon-catalog' },
  setup(_, nuxt) {
    const { resolve } = createResolver(import.meta.url)

    // Nuxt Icon reads every set from `@iconify/json` whenever that resolves from the app or a layer,
    // ignoring the per-set packages: the server would serve another version than the index lists and
    // ship all of its 400 MB
    const fullDataset = [nuxt.options.rootDir, nuxt.options.workspaceDir, ...nuxt.options._layers.map(layer => layer.cwd)]
      .map(dir => resolveFrom(dir, '@iconify/json/package.json'))
      .find(Boolean)

    if (fullDataset) {
      const message = `\`@iconify/json\` resolves (${fullDataset}); Nuxt Icon then ignores the \`@iconify-json/*\` sets. Remove it.`

      if (!nuxt.options.dev) {
        throw new Error(message)
      }

      logger.warn(message)
    }

    addServerTemplate({
      filename: ICON_CATALOG_TEMPLATE,
      async getContents() {
        const collections = (nuxt.options.icon?.serverBundle as { collections?: (string | { prefix: string })[] })
          ?.collections ?? []

        const prefixes = [...new Set(collections.map(collection => {
          return typeof collection === 'string' ? collection : collection.prefix
        }))]

        const layerDirs = nuxt.options._layers.map(layer => layer.cwd)
        const catalog: IconCatalog = []

        for (const prefix of prefixes) {
          const file = resolveCollectionFile(layerDirs, prefix)
          const data = JSON.parse(await readFile(file, 'utf8')) as IconSetJson
          const names: string[] = []
          const hidden = Object.keys(data.aliases ?? {})

          for (const [name, icon] of Object.entries(data.icons)) {
            (icon.hidden ? hidden : names).push(name)
          }

          catalog.push({ prefix, names, hidden })
        }

        return `export default ${JSON.stringify(catalog)}`
      },
    })

    addTypeTemplate({
      filename: 'types/gentl-icon-catalog.d.ts',
      getContents: () => [
        `declare module '${ICON_CATALOG_TEMPLATE}' {`,
        `  const catalog: import('${resolve('./runtime/icon-catalog-search')}').IconCatalog`,
        '  export default catalog',
        '}',
      ].join('\n'),
    }, { nitro: true })

    addServerHandler({
      route: '/_ui/icons/search',
      method: 'get',
      handler: resolve('./runtime/search.get'),
    })
  },
})

function resolveFrom(dir: string, specifier: string) {
  try {
    return createRequire(join(dir, 'package.json')).resolve(specifier)
  } catch {
    return undefined
  }
}

function resolveCollectionFile(layerDirs: string[], prefix: string) {
  const file = layerDirs.map(dir => resolveFrom(dir, `@iconify-json/${prefix}/icons.json`)).find(Boolean)

  if (file) {
    return file
  }

  throw new Error(`Icon set \`${prefix}\` is listed in icon.serverBundle.collections but @iconify-json/${prefix} is not installed`)
}
