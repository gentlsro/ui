import type { Middleware } from '@floating-ui/dom'
import type { MaybeElement, ReferenceElement } from '@floating-ui/vue'

export const cover: Middleware = {
  name: 'cover',
  fn: ({ y, rects, placement }) => {
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

export function useFloatingUIUtils() {
  function getElement(payload?: {
    elRef?: MaybeRefOrGetter<
      MaybeElement<ReferenceElement> | HTMLElement | string | ((parentEl?: HTMLElement | null) => MaybeElement<ReferenceElement> | HTMLElement | string) | null
    >

    /**
     * When `parentEl` is provided, the element will be searched within it
     */
    parentEl?: HTMLElement
  }) {
    const { elRef, parentEl } = payload ?? {}

    if (!import.meta.client) {
      return null
    }

    const el = unref(elRef)
    if (el === null) {
      return null
    }

    // When the string selector is provided, we need to find the element in the DOM
    if (typeof el === 'string') {
      return (parentEl ?? document).querySelector(el)
    }

    // When the element is already a DOM element, we just use it
    else if (el instanceof HTMLElement) {
      return el
    }

    // When we provided a function to resolve the element, we call it
    else if (typeof el === 'function') {
      return el(parentEl) as HTMLElement
    }

    // Otherwise, we assume it's a reference element
    // @ts-expect-error - We know it's a reference element
    return unrefElement(el)
  }

  function getLastFloatingUIZindex() {
    const lastFloatingElement = Array.from(document.body.children)
      .toReversed()
      .find(child => child.classList.contains('floating-element')) as HTMLElement

    if (!lastFloatingElement) {
      return 2999
    }

    const computedStyle = getComputedStyle(lastFloatingElement)
    const zIndex = +computedStyle.getPropertyValue('--zIndex')

    return Number(zIndex)
  }

  function getLastFloatingUI() {
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
