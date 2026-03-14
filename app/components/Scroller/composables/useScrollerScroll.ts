export function useScrollerScroll() {
  const self = getCurrentInstance()

  // Layout
  const scrollEl = ref<HTMLDivElement>()

  const { arrivedState, directions, x, y, measure } = useScroll(scrollEl)

  const isOverflown = computed(() => {
    return [
      arrivedState.left,
      arrivedState.right,
      arrivedState.top,
      arrivedState.bottom,
    ].some(Boolean)
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
    }

    // Scrolling left
    else if (ev.deltaY < 0 && !arrivedState.left) {
      handleScroll(-1 * scrollSpeed, 'x')
      ev.stopPropagation()
      ev.preventDefault()
    }

    // Scrolling up
    else if (ev.deltaY < 0 && !arrivedState.top) {
      handleScroll(-1 * scrollSpeed, 'y')
      ev.stopPropagation()
      ev.preventDefault()
    }

    // Scrolling down
    else if (ev.deltaY > 0 && !arrivedState.bottom) {
      handleScroll(scrollSpeed, 'y')
      ev.stopPropagation()
      ev.preventDefault()
    }
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
