import type { Middleware } from '@floating-ui/dom'
/** DOM target contract shared by overlay props and their resolver. */
export type FloatingTarget
  = | Element
    | string
    | { element: MaybeRefOrGetter<Element | null | undefined> }
    | { $el: unknown }
    | Ref<FloatingTarget>
    | ((parentEl?: HTMLElement) => FloatingTarget)
    | null
    | undefined

export const cover: Middleware = {
  name: 'cover',
  fn: ({ y, rects, placement, middlewareData }) => {
    // `matchHeight` already aligns the floating element with the reference,
    // shifting it again would push it out of the reference bounds
    if (middlewareData.matchHeight) {
      return {}
    }

    const modifier = placement.startsWith('bottom') ? -1 : 1
    const { height: referenceHeight } = rects.reference
    const { height: menuHeight } = rects.floating

    return {
      y: Math.max(y + modifier * (menuHeight / 2) - (referenceHeight / 2), 0),
    }
  },
}

export const fitWidth: Middleware = {
  name: 'fitWidth',
  fn: ({ elements, rects, x }) => {
    const minWidth = rects.reference.width
    const diff = minWidth - rects.floating.width
    elements.floating.style.minWidth = `${minWidth}px`

    if (diff > 0) {
      return { x: x + minWidth / 2 - rects.floating.width / 2 }
    }

    return {}
  },
}

export const matchWidth: Middleware = {
  name: 'matchWidth',
  fn: ({ elements, rects }) => {
    const width = rects.reference.width
    const floatingElStyle = getComputedStyle(elements.floating)
    const marginLeft = floatingElStyle.marginLeft
    const marginRight = floatingElStyle.marginRight

    elements.floating.style.width = `calc(${width}px - ${marginLeft} - ${marginRight})`
    elements.floating.style.maxWidth = `calc(${width}px - ${marginLeft} - ${marginRight})`

    return {
      x: rects.reference.x,
    }
  },
}

export const matchHeightMiddleware: Middleware = {
  name: 'matchHeight',
  fn: ({ elements, rects }) => {
    const height = rects.reference.height
    const floatingElStyle = getComputedStyle(elements.floating)
    const marginTop = floatingElStyle.marginTop
    const marginBottom = floatingElStyle.marginBottom

    elements.floating.style.height = `calc(${height}px - ${marginTop} - ${marginBottom})`
    elements.floating.style.maxHeight = `calc(${height}px - ${marginTop} - ${marginBottom})`

    return {
      y: rects.reference.y,
    }
  },
}

export function useFloatingUIUtils() {
  function getElement(payload?: {
    elRef?: FloatingTarget

    /**
     * When `parentEl` is provided, the element will be searched within it
     */
    parentEl?: HTMLElement
  }): Element | null {
    const { elRef, parentEl } = payload ?? {}

    if (!import.meta.client) {
      return null
    }

    const el = unref(elRef)

    // Resolve getter results through the same contract as direct props.
    if (typeof el === 'function') {
      return getElement({ elRef: el(parentEl), parentEl })
    }

    if (typeof el === 'string') {
      return (parentEl ?? document).querySelector(el)
    }

    if (el instanceof Element) {
      return el
    }

    if (el && typeof el === 'object') {
      // Explicit expose takes priority, including a temporarily missing element.
      if ('element' in el) {
        const element = toValue(el.element)

        return element instanceof Element ? element : null
      }

      // Compatibility for existing VDOM callers; never inspect private instances.
      if ('$el' in el && el.$el instanceof Element) {
        return el.$el
      }
    }

    return null
  }

  function getLastFloatingUIZindex() {
    if (!import.meta.client) {
      return 2999
    }

    const lastFloatingElement = Array.from(document.body.children)
      .toReversed()
      .find(child => {
        if (!child.classList.contains('floating-element')) {
          return false
        }

        const z = Number.parseFloat(
          getComputedStyle(child).getPropertyValue('--zIndex'),
        )

        return Number.isFinite(z) && z > 0
      }) as HTMLElement | undefined

    if (!lastFloatingElement) {
      return 2999
    }

    return Number.parseFloat(
      getComputedStyle(lastFloatingElement).getPropertyValue('--zIndex'),
    )
  }

  function getLastFloatingUI() {
    if (!import.meta.client) {
      return
    }

    return Array.from(document.body.children)
      .toReversed()
      .find(child => child.classList.contains('floating-element')) as HTMLElement
  }

  return {
    getElement,
    getLastFloatingUIZindex,
    getLastFloatingUI,
  }
}
