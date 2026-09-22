type IUseDrawerResizeOptions = {
  /**
   * The width of the drawer ~ written to while dragging the resizer
   */
  width: Ref<number>

  /**
   * The side of the page the drawer sits on ~
   * the resizer sits on the inner edge (the opposite one)
   */
  side: MaybeRefOrGetter<'left' | 'right'>

  /**
   * How narrow the drawer can get
   *
   * @default 200
   */
  minWidth?: number

  /**
   * How wide the drawer can get
   *
   * @default Infinity
   */
  maxWidth?: number
}

/**
 * Resizes a drawer by dragging the resizer on its inner edge
 */
export function useDrawerResize(options: IUseDrawerResizeOptions) {
  const isResizing = ref(false)

  const minWidth = options.minWidth ?? 200
  const maxWidth = options.maxWidth ?? Number.POSITIVE_INFINITY

  let currentX = 0
  let currentWidth = 0

  function handleMouseMove(event: MouseEvent) {
    // Dragging the resizer away from the drawer (towards the page) grows it
    const diffX = (event.clientX - currentX) * (toValue(options.side) === 'left' ? 1 : -1)

    requestAnimationFrame(() => {
      options.width.value = Math.min(Math.max(currentWidth + diffX, minWidth), maxWidth)
    })
  }

  function handleMouseUp() {
    document.removeEventListener('mousemove', handleMouseMove)
    document.removeEventListener('mouseup', handleMouseUp)

    document.documentElement.classList.remove('select-none')
    document.body.classList.remove('cursor-col-resize')
    isResizing.value = false
  }

  function handleMouseDown(event: MouseEvent) {
    if (event.button !== 0) {
      return
    }

    event.preventDefault()

    currentX = event.clientX
    currentWidth = options.width.value
    isResizing.value = true

    getSelection()?.removeAllRanges()
    document.documentElement.classList.add('select-none')
    document.body.classList.add('cursor-col-resize')

    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)
  }

  onUnmounted(handleMouseUp)

  return {
    handleMouseDown,
    isResizing,
  }
}
