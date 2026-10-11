// @vapor-ready
export function useScrollerScroll(onScrolled: (position: number) => void, axis: 'x' | 'y') {
  // Layout
  const scrollEl = ref<HTMLDivElement>()

  const { arrivedState, x, y, measure } = useScroll(scrollEl)

  // The content can change size while the scroller keeps its own (items loaded
  // or filtered out), and only a scroll would otherwise refresh the edges
  const contentEls = shallowRef<HTMLElement[]>([])

  function updateContentEls() {
    const children = [...scrollEl.value?.children ?? []]

    contentEls.value = children.filter(child => child instanceof HTMLElement)
  }

  watch(scrollEl, updateContentEls)
  useMutationObserver(scrollEl, updateContentEls, { childList: true })
  useResizeObserver(contentEls, () => measure())

  const isOverflown = computed(() => axis === 'x'
    ? !arrivedState.left || !arrivedState.right
    : !arrivedState.top || !arrivedState.bottom)

  // Scrolling
  let btnScrollSpeed = 4
  let btnScrollDirection: 'x' | 'y' = axis

  function handleScroll(distance: number, direction: 'x' | 'y') {
    if (direction === 'x') {
      scrollEl.value?.scrollBy({ left: distance, behavior: 'auto' })
    } else {
      scrollEl.value?.scrollBy({ top: distance, behavior: 'auto' })
    }
  }

  // Via wheel: a vertical wheel scrolls the horizontal scroller sideways, except
  // over content that scrolls vertically itself, which keeps the native scroll
  function handleWheel(ev: WheelEvent) {
    const el = scrollEl.value

    if (!el || ev.deltaX || !ev.deltaY || ev.ctrlKey || isInsideVerticalScroll(ev, el)) {
      return
    }

    const maxLeft = el.scrollWidth - el.clientWidth
    const isAtEdge = ev.deltaY > 0 ? el.scrollLeft >= maxLeft - 1 : el.scrollLeft <= 0

    if (isAtEdge) {
      return
    }

    el.scrollBy({ left: getWheelDistance(ev, el), behavior: 'auto' })
    ev.stopPropagation()
    ev.preventDefault()
  }

  // Via buttons
  const { pause, resume } = useRafFn(({ delta }) => {
    // Preserve the old acceleration (4→16 px per 5 ms) independently of refresh rate.
    const elapsed = Math.min(delta, 64)
    handleScroll(btnScrollSpeed * elapsed / 5, btnScrollDirection)
    btnScrollSpeed = Math.max(-16, Math.min(16, btnScrollSpeed * 1.02 ** (elapsed / 5)))
  }, { immediate: false })

  function handleScrollViaBtn(increment: boolean, direction: 'x' | 'y') {
    btnScrollSpeed = increment ? 4 : -4
    btnScrollDirection = direction
    resume()
  }

  useEventListener('pointerup', pause)
  useEventListener('pointercancel', pause)
  useEventListener('blur', pause)
  onScopeDispose(pause)

  watch(axis === 'x' ? x : y, onScrolled)

  return {
    x,
    y,
    scrollEl,
    arrivedState,
    isOverflown,
    measure,
    handleScroll,
    handleWheel,
    handleScrollViaBtn,
  }
}

function isInsideVerticalScroll(ev: WheelEvent, scrollEl: HTMLElement) {
  let el = ev.target instanceof Element ? ev.target : null

  while (el && el !== scrollEl) {
    if (el.scrollHeight > el.clientHeight + 1) {
      const { overflowY } = getComputedStyle(el)

      if (['auto', 'scroll', 'overlay'].includes(overflowY)) {
        return true
      }
    }

    el = el.parentElement
  }

  return false
}

function getWheelDistance(ev: WheelEvent, scrollEl: HTMLElement) {
  if (ev.deltaMode === WheelEvent.DOM_DELTA_LINE) {
    return ev.deltaY * 16
  }

  if (ev.deltaMode === WheelEvent.DOM_DELTA_PAGE) {
    return ev.deltaY * scrollEl.clientWidth
  }

  return ev.deltaY
}
