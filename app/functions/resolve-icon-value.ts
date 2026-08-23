import type { HTMLAttributes } from 'vue'
import { normalizeClass } from 'vue'

type IconValue = HTMLAttributes['class']

export type ResolvedIconValue = {
  classes: string
  name?: string
}

const canonicalIconNameRegex = /^[a-z0-9][a-z0-9-]*:[a-z0-9][\w-]*$/i
const legacyIconClassRegex
  = /^i-(?:[a-z0-9][a-z0-9-]*:[a-z0-9][\w-]*|[a-z0-9][\w-]*-[a-z0-9][\w-]*)$/i

function normalizeIconName(name: string) {
  return /^i-[^:]+:/i.test(name) ? name.slice(2) : name
}

/**
 * Separates an Iconify name from classes carried in the legacy `icon` prop.
 *
 * Both canonical names and UnoCSS-style icon tokens are part of the public
 * component contract. Styling tokens remain classes, while a recognized icon
 * token is passed to Nuxt Icon. The fallback retains the old behavior for
 * custom single-token icon names and class-only values.
 */
export function resolveIconValue(value?: IconValue): ResolvedIconValue {
  const normalized = normalizeClass(value).trim()

  if (!normalized) {
    return { classes: '' }
  }

  const tokens = normalized.split(/\s+/)
  let iconIndex = tokens.findIndex(token => legacyIconClassRegex.test(token))

  if (iconIndex === -1) {
    iconIndex = tokens.findIndex(token => canonicalIconNameRegex.test(token))
  }

  if (iconIndex === -1) {
    return typeof value === 'string' && tokens.length === 1
      ? { classes: '', name: value }
      : { classes: normalized }
  }

  const [name] = tokens.splice(iconIndex, 1)

  return {
    classes: tokens.join(' '),
    name: normalizeIconName(name!),
  }
}
