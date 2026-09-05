import { Draggable, PointerSensor } from 'dragdoll'

// @vapor-ready — callers pass native DOM refs; active gestures are scoped to their owner.

type Corner = 'nw' | 'n' | 'ne' | 'w' | 'e' | 'sw' | 's' | 'se'

type MoveStart = {
  x: number
  y: number
  originalX: number
  originalY: number
}

type ResizeStart = {
  corner: Corner
  startMouse: { x: number, y: number }
  original: { x: number, y: number, w: number, h: number }
}

type IDimensions = {
  x?: number | null
  y?: number | null
  w?: number | null
  h?: number | null
}

export function useElementMovement(payload: {
  constrainToPage?: boolean
  dimensions?: Ref<IDimensions>
  referenceEl?: MaybeRefOrGetter<HTMLElement | null | undefined>
  moveHandle?: MaybeRefOrGetter<HTMLElement | null | undefined>
  resizeHandles?: MaybeRefOrGetter<HTMLElement | null | undefined>
  canMove?: () => boolean
  limits?: {
    minW?: number
    minH?: number
    maxW?: number
    maxH?: number
  }
}) {
  const {
    dimensions = ref({ x: 0, y: 0, w: 0, h: 0 }),
    referenceEl,
    limits,
    constrainToPage = true,
  } = payload

  const isMoving = ref(false)
  const isResizing = ref(false)
  const activeCorner = ref<Corner | null>(null)

  const moveStart = ref<MoveStart>({ x: 0, y: 0, originalX: 0, originalY: 0 })
  const resizeStart = ref<ResizeStart | null>(null)

  // The handle can mount later (for example when a Menu opens).
  watch(
    () => [toValue(payload.moveHandle), toValue(payload.resizeHandles)] as const,
    ([moveHandle, resizeHandles], _, onCleanup) => {
      const registrations: (() => void)[] = []
      for (const [element, resizing] of [[moveHandle, false], [resizeHandles, true]] as const) {
        if (!element) {
          continue
        }
        let corner: Corner | undefined
        let previousUserSelect = ''
        const sensor = new PointerSensor(element, {
          sourceEvents: 'pointer',
          cancelOnEscape: true,
          startPredicate: event => {
            if (!(event instanceof PointerEvent) || event.button !== 0) {
              return false
            }
            if (resizing) {
              corner = event.target instanceof Element
                ? event.target.closest<HTMLElement>('[data-resize-corner]')?.dataset.resizeCorner as Corner | undefined
                : undefined
              if (!corner) {
                return false
              }
            } else if (payload.canMove && !payload.canMove()) {
              return false
            }
            event.preventDefault()

            return true
          },
        })
        const draggable = new Draggable([sensor], {
          // Vue owns the geometry; Dragdoll provides pointer lifecycle and RAF sampling.
          elements: () => [],
          startPredicate: () => true,
          onStart: drag => {
            previousUserSelect = document.body.style.userSelect
            document.body.style.userSelect = 'none'
            const pos = drag.startEvent
            if (resizing && corner) {
              const rect = toValue(referenceEl)?.getBoundingClientRect()
              resizeStart.value = {
                corner,
                startMouse: { x: pos.x, y: pos.y },
                original: {
                  x: rect?.x ?? dimensions.value.x ?? 0,
                  y: rect?.y ?? dimensions.value.y ?? 0,
                  w: rect?.width ?? dimensions.value.w ?? 0,
                  h: rect?.height ?? dimensions.value.h ?? 0,
                },
              }
              isResizing.value = true
              activeCorner.value = corner
            } else {
              moveStart.value = {
                x: pos.x,
                y: pos.y,
                originalX: dimensions.value.x ?? 0,
                originalY: dimensions.value.y ?? 0,
              }
              isMoving.value = true
            }
          },
          onMove: drag => resizing ? updateResize(drag.moveEvent) : updateMove(drag.moveEvent),
          onEnd: drag => {
            // The release can arrive before Dragdoll's next sampled frame.
            if (drag.endEvent?.type === 'end') {
              if (resizing) {
                updateResize(drag.endEvent)
              } else {
                updateMove(drag.endEvent)
              }
            }
            document.body.style.userSelect = previousUserSelect
            isMoving.value = false
            isResizing.value = false
            activeCorner.value = null
          },
        })
        registrations.push(() => {
          sensor.cancel()
          draggable.destroy()
          sensor.destroy()
        })
      }
      onCleanup(() => registrations.forEach(dispose => dispose()))
    },
    { immediate: true, flush: 'post' },
  )

  function updateMove(pos: { x: number, y: number }) {
    if (!isMoving.value) {
      return
    }

    const dx = pos.x - moveStart.value.x
    const dy = pos.y - moveStart.value.y

    const proposedX = moveStart.value.originalX + dx
    const proposedY = moveStart.value.originalY + dy

    const width = dimensions.value.w ?? 0
    const height = dimensions.value.h ?? 0

    const winWidth = typeof window !== 'undefined' ? window.innerWidth : width
    const winHeight = typeof window !== 'undefined' ? window.innerHeight : height

    const maxX = Math.max(0, winWidth - width)
    const maxY = Math.max(0, winHeight - height)

    dimensions.value.x = Math.min(Math.max(0, proposedX), maxX)
    dimensions.value.y = Math.min(Math.max(0, proposedY), maxY)
  }

  function updateResize(pos: { x: number, y: number }) {
    if (!isResizing.value || !resizeStart.value) {
      return
    }

    const { original, startMouse, corner } = resizeStart.value

    const dx = pos.x - startMouse.x
    const dy = pos.y - startMouse.y

    let newX = original.x
    let newY = original.y
    let newWidth = original.w
    let newHeight = original.h

    switch (corner) {
      case 'nw':
        newWidth = original.w - dx
        newHeight = original.h - dy
        newX = original.x + dx
        newY = original.y + dy
        break
      case 'n':
        newHeight = original.h - dy
        newY = original.y + dy
        break
      case 'ne':
        newWidth = original.w + dx
        newHeight = original.h - dy
        newX = original.x
        newY = original.y + dy
        break
      case 'w':
        newWidth = original.w - dx
        newX = original.x + dx
        break
      case 'e':
        newWidth = original.w + dx
        break
      case 'sw':
        newWidth = original.w - dx
        newX = original.x + dx
        newHeight = original.h + dy
        break
      case 's':
        newHeight = original.h + dy
        break
      case 'se':
        newWidth = original.w + dx
        newHeight = original.h + dy
        break
    }

    // Clamp by limits
    const minW = limits?.minW ?? 0
    const minH = limits?.minH ?? 0
    const maxW = limits?.maxW ?? Number.POSITIVE_INFINITY
    const maxH = limits?.maxH ?? Number.POSITIVE_INFINITY

    const isWest = corner === 'w' || corner === 'nw' || corner === 'sw'
    const isNorth = corner === 'n' || corner === 'nw' || corner === 'ne'

    if (newWidth < minW) {
      if (isWest) {
        newX += newWidth - minW
      }
      newWidth = minW
    }
    if (newWidth > maxW) {
      if (isWest) {
        newX += newWidth - maxW
      }
      newWidth = maxW
    }

    if (newHeight < minH) {
      if (isNorth) {
        newY += newHeight - minH
      }
      newHeight = minH
    }
    if (newHeight > maxH) {
      if (isNorth) {
        newY += newHeight - maxH
      }
      newHeight = maxH
    }

    // Also clamp by page (document/body) width so the box never extends past page bounds
    const pageWidth = typeof document !== 'undefined'
      ? (document.body?.clientWidth || document.documentElement?.clientWidth || window.innerWidth)
      : Number.POSITIVE_INFINITY

    if (constrainToPage && Number.isFinite(pageWidth)) {
      // East-side resizing: right edge cannot exceed pageWidth
      if (corner === 'e' || corner === 'ne' || corner === 'se') {
        const maxWidthByPage = Math.max(0, pageWidth - original.x)
        if (newWidth > maxWidthByPage) {
          newWidth = maxWidthByPage
        }
      }

      // West-side resizing: left edge cannot go below 0
      if (corner === 'w' || corner === 'nw' || corner === 'sw') {
        const maxWidthByPage = Math.max(0, original.w + original.x)
        if (newWidth > maxWidthByPage) {
          newWidth = maxWidthByPage
          // Recompute newX to keep the right edge anchored
          newX = original.x + (original.w - newWidth)
        }
        // Ensure left edge stays within 0 after other clamps
        if (newX < 0) {
          const shift = -newX
          newX = 0
          newWidth = Math.min(newWidth + shift, maxWidthByPage)
        }
      }
    }

    dimensions.value.w = newWidth
    dimensions.value.h = newHeight
    dimensions.value.x = newX
    dimensions.value.y = newY
  }

  return { isMoving, isResizing, activeCorner }
}
