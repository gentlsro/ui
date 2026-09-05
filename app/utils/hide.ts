type FloatingElement = Element & {
  hide?: (force?: boolean) => void
}

/**
 * Closes the current dialog/menu
 *
 * If we provide a DOM `target`, it will close its nearest dialog/menu.
 * Otherwise it will close the latest dialog/menu.
 */
export function $hide(options?: {
  /**
   * A floating element or any DOM descendant within it.
   * An explicitly missing target does nothing instead of closing another overlay.
   */
  target?: Element | null

  /**
   * When true, all the floating UIs will be hidden (with exception of `ignore`d elements)
   *
   * NOTE: When `all` is true, the `target` does nothing
   */
  all?: boolean

  /**
   * Elements to skip when hiding all overlays or the latest overlay
   */
  ignore?: Element[]

  /**
   * With `all`, only matching elements after this boundary in DOM order are hidden
   *
   * NOTE: Takes precedence over `ignore`
   */
  ignoreUntilEl?: Element | null

  /**
   * The type of the floating element to hide
   */
  type?: 'menu' | 'dialog'

  /**
   * When true, the floating element will be hidden even when having `persistent` prop
   */
  force?: boolean
}) {
  if (!import.meta.client) {
    return
  }

  let { target, all, ignore = [], ignoreUntilEl, type, force = false } = options ?? {}
  let selector = '.floating-element'

  if (type === 'menu') {
    selector += '.menu'
  } else if (type === 'dialog') {
    selector += '.dialog__wrapper'
  }

  const floatingEls = Array.from(document.querySelectorAll<FloatingElement>(selector))

  if (all) {
    if (ignoreUntilEl) {
      const idx = floatingEls.findIndex(el => el === ignoreUntilEl)

      ignore = floatingEls.slice(0, idx + 1)
    }

    floatingEls.forEach(el => {
      const isIgnored = ignore.includes(el)

      if (!isIgnored) {
        el.hide?.(force)
      }
    })

    return
  }

  if (options && 'target' in options) {
    const floatingEl = target?.closest<FloatingElement>(selector)

    floatingEl?.hide?.(force)

    return
  }

  // Ignoring the latest overlay does not fall through to an older one.
  const floatingEl = floatingEls[floatingEls.length - 1]
  const isIgnored = floatingEl && ignore.includes(floatingEl)

  if (!isIgnored) {
    floatingEl?.hide?.(force)
  }
}
