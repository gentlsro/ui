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
 * Both canonical names and legacy Uno values can arrive in arrays/class maps.
 * Keep legacy classes for CSS variants/custom Uno collections, but also expose
 * the name so runtime data can render without a pre-generated CSS rule.
 */
export function resolveIconValue(value?: IconValue): ResolvedIconValue {
  const normalized = normalizeClass(value).trim()
  if (!normalized) {
    return { classes: '' }
  }

  const tokens = normalized.split(/\s+/)

  // A legacy icon identifies the collection before custom Uno variants such
  // as `wrapper:w-4`; keep its name for native runtime data and its CSS classes.
  const legacyIndex = tokens.findIndex(token => token.startsWith('i-'))
  const iconIndex = legacyIndex !== -1
    ? legacyIndex
    : tokens.findIndex(token => canonicalIconNameRegex.test(token) && !classVariantRegex.test(token))

  if (iconIndex === -1) {
    return typeof value === 'string' && /^\S+$/.test(value) && !classVariantRegex.test(value)
      ? { classes: '', name: value }
      : { classes: normalized }
  }

  const name = tokens[iconIndex]!
  if (!name.startsWith('i-') || (typeof value === 'string' && tokens.length === 1)) {
    tokens.splice(iconIndex, 1)
  }

  return { classes: tokens.join(' '), name }
}
