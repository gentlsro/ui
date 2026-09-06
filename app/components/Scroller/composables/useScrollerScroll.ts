// @vapor-ready
export function useScrollerScroll(onScrolled: (position: number) => void, axis: 'x' | 'y') {
  // Layout
  const scrollEl = ref<HTMLDivElement>()

  const { arrivedState, x, y, measure } = useScroll(scrollEl)

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

  // Via wheel
  function handleWheel(ev: WheelEvent) {
    if (ev.deltaX) {
      return
    }

    const scrollSpeed = 25

    // Scrolling right
    if (ev.deltaY > 0 && !arrivedState.right) {
      handleScroll(scrollSpeed, 'x')
      ev.stopPropagation()
      ev.preventDefault()
    } else if (ev.deltaY < 0 && !arrivedState.left) {
      handleScroll(-1 * scrollSpeed, 'x')
      ev.stopPropagation()
      ev.preventDefault()
    } else if (ev.deltaY < 0 && !arrivedState.top) {
      handleScroll(-1 * scrollSpeed, 'y')
      ev.stopPropagation()
      ev.preventDefault()
    } else if (ev.deltaY > 0 && !arrivedState.bottom) {
      handleScroll(scrollSpeed, 'y')
      ev.stopPropagation()
      ev.preventDefault()
    }
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
