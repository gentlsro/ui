import { defineEventHandler, getQuery, setResponseHeader } from 'h3'

import { checkIcons, searchIcons } from './icon-catalog-search'
import type { IconCatalog } from './icon-catalog-search'

let catalog: Promise<IconCatalog> | undefined

/**
 * `?q=arrow right&limit=96` searches the catalog: `{ icons, total }`.
 * `?names=lucide:house,i-mdi:home` checks values instead: `{ valid, invalid }`.
 */
export default defineEventHandler(async event => {
  catalog ??= import('#gentl-icon-catalog').then(module => module.default as IconCatalog)

  const query = getQuery(event)
  const icons = await catalog

  // The catalog changes only with a deploy
  setResponseHeader(event, 'cache-control', 'public, max-age=3600')

  if (typeof query.names === 'string') {
    return checkIcons(icons, query.names.split(',').filter(Boolean))
  }

  return searchIcons(icons, typeof query.q === 'string' ? query.q : '', {
    limit: query.limit ? Number(query.limit) || undefined : undefined,
  })
})
