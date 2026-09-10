const DRAG_THRESHOLD_PX = 5

/**
 * Tells apart a click from the `click` the browser fires at the end of a drag
 * (panning a container, selecting text…), so click-outside handlers can ignore
 * the latter
 */
export function useDragRelease() {
  let pointerDownPosition: { x: number, y: number } | undefined

  useEventListener(
    window,
    'pointerdown',
    (ev: PointerEvent) => {
      pointerDownPosition = { x: ev.clientX, y: ev.clientY }
    },
    { passive: true, capture: true },
  )

  /**
   * Whether the pointer travelled since it went down ~ the event is a drag release
   */
  function isDragRelease(ev: Event) {
    if (!pointerDownPosition || !(ev instanceof MouseEvent)) {
      return false
    }

    const distance = Math.hypot(
      ev.clientX - pointerDownPosition.x,
      ev.clientY - pointerDownPosition.y,
    )

    return distance > DRAG_THRESHOLD_PX
  }

  return { isDragRelease }
}
