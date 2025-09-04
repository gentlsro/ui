import type { ComponentInternalInstance } from 'vue'

/**
 * Closes the current dialog/menu
 *
 * If we provide `instance` argument, it will close the dialog/menu
 * of that instance, otherwise it will close the latest dialog/menu
 */
export function $hide(options?: {
  /**
   * When providing `instance`, the function will close the floating element that
   * the `instance` is inside of
   */
  instance?: ComponentInternalInstance | null

  /**
   * When true, all the floating UIs will be hidden (with exception of `ignore`d elements)
   *
   * NOTE: When `all` is true, the `instance` does nothing
   */
  all?: boolean

  /**
   * A list of elements that should not be hidden
   */
  ignore?: Element[]

  /**
   * When provided, only the elements *after` (in DOM) will get hidden
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
  let { instance, all, ignore = [], ignoreUntilEl, type, force } = options ?? {}
  let selector = '.floating-element'

  if (type === 'menu') {
    selector += '.menu'
  } else if (type === 'dialog') {
    selector += '.dialog__wrapper'
  }

  const floatingEls = Array.from(document.querySelectorAll(selector))

  if (all) {
    if (ignoreUntilEl) {
      const idx = floatingEls.findIndex(el => el === ignoreUntilEl)

      ignore = floatingEls.slice(0, idx + 1)
    }

    floatingEls?.forEach(el => {
      const isIgnored = ignore.includes(el)

      if (!isIgnored) {
        // @ts-expect-error DOM attribute
        el?.hide(force)
      }
    })

    return
  }

  if (instance) {
    const floatingEl = instance?.vnode.el?.closest(selector)

    floatingEl?.hide(force)
  }

  // Hides the last floating element
  else {
    const floatingEl = floatingEls[floatingEls.length - 1]
    const isIgnored = floatingEl && ignore.includes(floatingEl)

    if (!isIgnored) {
      // @ts-expect-error DOM attribute
      floatingEl?.hide(force)
    }
  }
}
