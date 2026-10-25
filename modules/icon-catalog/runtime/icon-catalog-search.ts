/**
 * One icon set of the catalog: the names offered by search, and the names that are valid but not offered
 * (hidden icons and aliases of renamed ones).
 */
export type IconCatalogSet = {
  prefix: string
  names: string[]
  hidden: string[]
}

/**
 * The searchable icon sets, in search order (`icon-collections.ts`)
 */
export type IconCatalog = IconCatalogSet[]

export const ICON_SEARCH_DEFAULT_LIMIT = 96
export const ICON_SEARCH_MAX_LIMIT = 200

// Exact name, name starts with the term, a word of the name starts with it, every typed word starts a word of the name
const RANK_EXACT = 0
const RANK_START = 1
const RANK_WORD = 2
const RANK_WORDS = 3

function rankName(name: string, term: string, words: string[]) {
  if (name === term) {
    return RANK_EXACT
  }

  if (name.startsWith(term)) {
    return RANK_START
  }

  if (name.includes(`-${term}`)) {
    return RANK_WORD
  }

  if (words.length > 1) {
    const nameWords = name.split('-')

    if (words.every(word => nameWords.some(nameWord => nameWord.startsWith(word)))) {
      return RANK_WORDS
    }
  }

  return -1
}

/**
 * Searches icon names. Words typed with spaces all have to appear in the name; `set:` before the
 * words narrows the search to that set (alone, it lists the set).
 */
export function searchIcons(catalog: IconCatalog, query: string, options?: { limit?: number }) {
  const limit = Math.min(Math.max(options?.limit ?? ICON_SEARCH_DEFAULT_LIMIT, 1), ICON_SEARCH_MAX_LIMIT)

  let text = query.trim().toLowerCase()
  let sets = catalog

  const colonIdx = text.indexOf(':')

  if (colonIdx !== -1) {
    const prefix = text.slice(0, colonIdx)

    sets = catalog.filter(set => set.prefix === prefix)
    text = text.slice(colonIdx + 1).trim()

    if (!text) {
      const icons = sets.flatMap(set => set.names.map(name => `${set.prefix}:${name}`))

      return { icons: icons.slice(0, limit), total: icons.length }
    }
  }

  const words = text.split(/[\s-]+/).filter(Boolean)

  if (!words.length) {
    return { icons: [], total: 0 }
  }

  const term = words.join('-')
  const matches: { icon: string, rank: number, length: number, setIdx: number }[] = []

  sets.forEach((set, setIdx) => {
    for (const name of set.names) {
      const rank = rankName(name, term, words)

      if (rank !== -1) {
        matches.push({ icon: `${set.prefix}:${name}`, rank, length: name.length, setIdx })
      }
    }
  })

  // Array.sort is stable, so the catalog order decides what is left
  matches.sort((a, b) => a.rank - b.rank || a.length - b.length || a.setIdx - b.setIdx)

  return {
    icons: matches.slice(0, limit).map(match => match.icon),
    total: matches.length,
  }
}

/**
 * Splits icon values into those the catalog renders and those it does not. A value is `set:name`,
 * optionally written `i-set:name`; aliases and hidden icons are valid.
 */
export function checkIcons(catalog: IconCatalog, values: string[]) {
  const setsByPrefix = new Map(catalog.map(set => [set.prefix, set]))
  const valid: string[] = []
  const invalid: string[] = []

  for (const value of values) {
    const [prefix, name] = value.replace(/^i-/, '').split(':')
    const set = prefix ? setsByPrefix.get(prefix) : undefined
    const isValid = !!set && !!name && (set.names.includes(name) || set.hidden.includes(name))

    ;(isValid ? valid : invalid).push(value)
  }

  return { valid, invalid }
}
