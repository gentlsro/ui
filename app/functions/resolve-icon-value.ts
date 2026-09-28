import type { HTMLAttributes } from 'vue'
import { normalizeClass } from 'vue'

type IconValue = HTMLAttributes['class']

export type ResolvedIconValue = {
  classes: string
  name?: string
}

const canonicalIconNameRegex = /^[a-z0-9][a-z0-9-]*:[a-z0-9][\w-]*$/i
// Class variants can also contain a colon, but are not Iconify collections.
const classVariantRegex
  = /^(?:[2-9]?xl|xs|sm|md|lg|hover|focus(?:-visible|-within)?|active|disabled|enabled|checked|dark|light|first|last|odd|even|visited|print|motion-safe|motion-reduce|group-hover|group-focus|peer-checked):/i

/**
 * Canonical Iconify names can carry styling classes. Legacy UnoCSS values keep
 * their class rendering when mixed with other classes or supplied as arrays/maps,
 * including custom collections unavailable to Nuxt Icon. A single string keeps
 * the existing Nuxt Icon/custom component behavior.
 */
export function resolveIconValue(value?: IconValue): ResolvedIconValue {
  const normalized = normalizeClass(value).trim()
  if (!normalized) {
    return { classes: '' }
  }

  const tokens = normalized.split(/\s+/)
  const iconIndex = tokens.findIndex(token => {
    return !token.startsWith('i-')
      && canonicalIconNameRegex.test(token)
      && !classVariantRegex.test(token)
  })

  if (iconIndex === -1) {
    return typeof value === 'string' && /^\S+$/.test(value) && !classVariantRegex.test(value)
      ? { classes: '', name: value }
      : { classes: normalized }
  }

  const [name] = tokens.splice(iconIndex, 1)

  return { classes: tokens.join(' '), name }
}
