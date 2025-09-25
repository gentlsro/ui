import type { MaybeElementRef } from '@vueuse/core'

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

function getMouseFromEvent(event: MouseEvent | TouchEvent): { x: number, y: number } {
  if (event instanceof MouseEvent) {
    return { x: event.clientX, y: event.clientY }
  }
  return {
    x: event.touches[0]?.clientX ?? 0,
    y: event.touches[0]?.clientY ?? 0,
  }
}

function disableTextSelection() {
  if (typeof document === 'undefined') {
    return
  }
  const style = document.body?.style
  if (!style) {
    return
  }
  style.setProperty('user-select', 'none')
  style.setProperty('-webkit-user-select', 'none')
  style.setProperty('-ms-user-select', 'none')
}

function enableTextSelection() {
  if (typeof document === 'undefined') {
    return
  }
  const style = document.body?.style
  if (!style) {
    return
  }
  style.removeProperty('user-select')
  style.removeProperty('-webkit-user-select')
  style.removeProperty('-ms-user-select')
}

export function useElementMovement(payload: {
  dimensions?: Ref<IDimensions>
  referenceEl?: MaybeElementRef<any>
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
  } = payload

  const isMoving = ref(false)
  const isResizing = ref(false)
  const activeCorner = ref<Corner | null>(null)

  const moveStart = ref<MoveStart>({ x: 0, y: 0, originalX: 0, originalY: 0 })
  const resizeStart = ref<ResizeStart | null>(null)

  // Movement
  function onMoveMouseDown(event: MouseEvent | TouchEvent) {
    const pos = getMouseFromEvent(event)

    if (event instanceof MouseEvent && event.button !== 0) {
      return
    }

    moveStart.value = {
      x: pos.x,
      y: pos.y,
      originalX: dimensions.value?.x ?? 0,
      originalY: dimensions.value?.y ?? 0,
    }
    isMoving.value = true

    disableTextSelection()

    window.addEventListener('mousemove', onMoveMouseMove)
    window.addEventListener('mouseup', onMoveMouseUp)
    window.addEventListener('touchmove', onMoveMouseMove)
    window.addEventListener('touchend', onMoveMouseUp)
  }

  function onMoveMouseMove(event: MouseEvent | TouchEvent) {
    if (!isMoving.value) {
      return
    }

    requestAnimationFrame(() => {
      const pos = getMouseFromEvent(event)
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
    })
  }

  function onMoveMouseUp() {
    requestAnimationFrame(() => {
      isMoving.value = false
      enableTextSelection()
    })

    window.removeEventListener('mousemove', onMoveMouseMove)
    window.removeEventListener('mouseup', onMoveMouseUp)
    window.removeEventListener('touchmove', onMoveMouseMove)
    window.removeEventListener('touchend', onMoveMouseUp)
  }

  // Resizing
  function onResizeMouseDown(corner: Corner, event: MouseEvent | TouchEvent) {
    const pos = getMouseFromEvent(event)

    // Use the reference element's current box as original
    const rect = unrefElement(referenceEl)?.getBoundingClientRect?.()
    const original = {
      x: rect?.x ?? dimensions.value.x,
      y: rect?.y ?? dimensions.value.y,
      w: rect?.width ?? dimensions.value.w,
      h: rect?.height ?? dimensions.value.h,
    }

    resizeStart.value = {
      corner,
      startMouse: { x: pos.x, y: pos.y },
      original,
    }
    isResizing.value = true
    activeCorner.value = corner
    disableTextSelection()

    window.addEventListener('mousemove', onResizeMouseMove)
    window.addEventListener('mouseup', onResizeMouseUp)
    window.addEventListener('touchmove', onResizeMouseMove)
    window.addEventListener('touchend', onResizeMouseUp)
  }

  function onResizeMouseMove(event: MouseEvent | TouchEvent) {
    if (!isResizing.value || !resizeStart.value) {
      return
    }

    const pos = getMouseFromEvent(event)
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

    if (Number.isFinite(pageWidth)) {
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

  function onResizeMouseUp() {
    isResizing.value = false
    activeCorner.value = null
    enableTextSelection()

    window.removeEventListener('mousemove', onResizeMouseMove)
    window.removeEventListener('mouseup', onResizeMouseUp)
    window.removeEventListener('touchmove', onResizeMouseMove)
    window.removeEventListener('touchend', onResizeMouseUp)
  }

  return {
    // State
    isMoving,
    isResizing,
    activeCorner,

    // Movement
    onMoveMouseDown,

    // Resizing
    onResizeMouseDown,
  }
}
