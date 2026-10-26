import { defaultIconProps, getIconData } from '@iconify/utils'
import type { IconifyJSON } from '@iconify/types'
import { generateItemCSSRules } from '@iconify/utils/lib/css/common'
import type { IconAsset, RuntimeIcon } from '../../app/types/runtime-icon.type'

const loadRuntimeIcon = defineCachedFunction(async (name: string, options: {
  baseURL: string
  endpoint: string
}): Promise<RuntimeIcon> => {
  const { baseURL, endpoint } = options
  try {
    // Development's public asset proxy can live outside Nitro's local fetch.
    // The data provider remains usable before Uno has produced its manifest.
    const manifest = await $fetch<Record<string, IconAsset>>(`${baseURL}/_icons/manifest.json`).catch(() => ({} as Record<string, IconAsset>))
    const asset = manifest[name]
    if (asset) {
      return { name, status: 'ready', mode: asset.mode, url: `${baseURL}${asset.url}` }
    }
    const [collection, id = ''] = name.split(':')
    // Reuse Nuxt Icon's data provider (local/custom bundles and its configured
    // server fallback), never its VDOM renderer or client Iconify Vue runtime.
    const data = await $fetch<IconifyJSON>(`${baseURL}${endpoint}/${collection}`, {
      query: { icons: id },
      timeout: 5000,
    })
    const icon = data && getIconData(data, id)
    if (!icon) {
      return { name, status: 'missing' }
    }
    const mode = icon.body.includes('currentColor') ? 'mask' : 'background'
    const rules = generateItemCSSRules({ ...defaultIconProps, ...icon }, { mode })
    const url = String(rules[mode === 'mask' ? 'mask-image' : 'background-image'])

    return { name, status: 'ready', mode, url: url.slice(5, -2) }
  } catch {
    // A missing/temporarily unavailable decorative icon is data, not a failed
    // browser resource. Avoid console noise and retain the CSS class fallback.
    return { name, status: 'unavailable' }
  }
}, {
  maxAge: 60,
  // A temporary outage must not poison the next request. Nitro hashes both
  // arguments, avoiding key collisions between collection/icon spellings.
  validate: entry => !!entry.value && entry.value.status !== 'unavailable',
})

export default defineEventHandler(event => {
  const name = String(getQuery(event).name ?? '')
  if (!/^[a-z0-9][a-z0-9-]*:[a-z0-9][\w-]*$/i.test(name)) {
    return { name, status: 'missing' } satisfies RuntimeIcon
  }
  const config = useRuntimeConfig(event)

  return loadRuntimeIcon(name, {
    baseURL: config.app.baseURL.replace(/\/$/, ''),
    endpoint: config.public.uiIconEndpoint,
  })
})
