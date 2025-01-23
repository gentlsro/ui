import type { MaybeElementRef } from '@vueuse/core'

function getScrollbarWidth() {
  if (!import.meta.client) {
    return 0
  }

  // Creating invisible container
  const outer = document.createElement('div')
  outer.style.visibility = 'hidden'
  outer.style.overflow = 'scroll' // forcing scrollbar to appear

  // @ts-expect-error Typing - CSS property
  outer.style.msOverflowStyle = 'scrollbar' // needed for WinJS apps
  document.body.appendChild(outer)

  // Creating inner element and placing it in the container
  const inner = document.createElement('div')
  outer.appendChild(inner)

  // Calculating difference between container's full width and the child width
  const scrollbarWidth = outer.offsetWidth - inner.offsetWidth

  // Removing temporary elements from the DOM
  outer.parentNode!.removeChild(outer)

  return scrollbarWidth
}

export type IOverflowOptions = {
  direction?: 'any' | 'horizontal' | 'vertical'
  returnDiff?: boolean
}

export function useOverflow() {
  const previousOverflowState = ref<any>()
  const scrollbarWidth = getScrollbarWidth()

  const isOverflown = (
    { clientWidth, clientHeight, scrollWidth, scrollHeight }: Element,
    options?: IOverflowOptions,
  ) => {
    const { direction = 'any', returnDiff } = options || {}
    const xDiff = scrollWidth - clientWidth
    const yDiff = scrollHeight - clientHeight

    switch (direction) {
      case 'any':
        return returnDiff ? { xDiff, yDiff } : xDiff > 0 || yDiff > 0
      case 'horizontal':
        return returnDiff ? { xDiff } : xDiff > 0
      case 'vertical':
        return returnDiff ? { yDiff } : yDiff > 0
    }
  }

  const onOverflow = (
    elRef: MaybeElementRef,
    handler: (
      isOverflown: boolean | { xDiff?: number, yDiff?: number }
    ) => void,
    options?: IOverflowOptions,
  ) => {
    useResizeObserver(elRef, entries => {
      if (!entries[0]) {
        return
      }

      const _isOverflown = isOverflown(entries[0].target, options)

      // We don't need to update the state (and process the change) if it's the same
      if (isEqual(_isOverflown, previousOverflowState.value)) {
        return
      }

      handler(_isOverflown)
      previousOverflowState.value = _isOverflown
    })

    return () => {
      const el = unrefElement(elRef)

      nextTick(() => handler(isOverflown(el!, options)))
    }
  }

  return {
    scrollbarWidth,
    isOverflown,
    onOverflow,
  }
}
