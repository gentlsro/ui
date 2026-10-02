export function useScrollerScroll() {
  const self = getCurrentInstance()

  // Layout
  const scrollEl = ref<HTMLDivElement>()

  const { arrivedState, directions, x, y, measure } = useScroll(scrollEl)

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

  const isOverflown = computed(() => {
    return !arrivedState.left
      || !arrivedState.right
      || !arrivedState.top
      || !arrivedState.bottom
  })

  // Scrolling
  const btnScrollSpeed = ref(4)
  const btnScrollDirection = ref<'x' | 'y'>('x')
  const clampedScrollSpeed = useClamp(btnScrollSpeed, -16, 16)

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
  const { pause, resume } = useIntervalFn(
    () => {
      handleScroll(clampedScrollSpeed.value, btnScrollDirection.value)

      btnScrollSpeed.value = btnScrollSpeed.value * 1.02
    },
    5,
    { immediate: false },
  )

  function handleScrollViaBtn(increment: boolean, direction: 'x' | 'y') {
    btnScrollSpeed.value = increment ? 4 : -4
    btnScrollDirection.value = direction
    resume()

    window.addEventListener('pointerup', stopScrolling)
  }

  function stopScrolling() {
    pause()
    window.removeEventListener('pointerup', stopScrolling)
  }

  watch(directions, directions => {
    const xAxis = [directions.left, directions.right].some(Boolean)
    const yAxis = [directions.top, directions.bottom].some(Boolean)

    if (xAxis) {
      self?.emit('scrolled', x.value)
    } else if (yAxis) {
      self?.emit('scrolled', y.value)
    }
  })

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
