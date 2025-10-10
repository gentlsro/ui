import type { MaybeElementRef } from '@vueuse/core'

type Corner = 'nw' | 'n' | 'ne' | 'w' | 'e' | 'sw' | 's' | 'se'

type CornerLimits = { min?: number, max?: number }

type CornerStart = {
  corner: Corner
  startMouse: { x: number, y: number }
  originalValue: number
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

export function useCornerAdjustment(payload: {
  corners: Ref<Record<Corner, number> | undefined>
  referenceEl?: MaybeElementRef<any>
  limits?: Partial<Record<Corner, CornerLimits>>
  step?: number
  inverted?: boolean | Partial<Record<Corner, boolean>>
}) {
  const {
    corners,
    referenceEl: _referenceEl,
    limits = {},
    step,
    inverted,
  } = payload

  // Initialize corners if not set
  if (!corners.value) {
    corners.value = { nw: 0, n: 0, ne: 0, w: 0, e: 0, sw: 0, s: 0, se: 0 }
  }

  const isAdjusting = ref(false)
  const activeCorner = ref<Corner | null>(null)
  const cornerStart = ref<CornerStart | null>(null)

  // Helper to check if a corner should be inverted
  function isCornerInverted(corner: Corner): boolean {
    if (typeof inverted === 'boolean') {
      return inverted
    }
    if (inverted && typeof inverted === 'object') {
      return inverted[corner] === true
    }
    return false
  }

  function onCornerMouseDown(corner: Corner, event: MouseEvent | TouchEvent) {
    const pos = getMouseFromEvent(event)

    if (event instanceof MouseEvent && event.button !== 0) {
      return
    }

    const originalValue = (corners.value as Record<Corner, number>)[corner]

    cornerStart.value = {
      corner,
      startMouse: { x: pos.x, y: pos.y },
      originalValue,
    }
    isAdjusting.value = true
    activeCorner.value = corner
    disableTextSelection()

    window.addEventListener('mousemove', onCornerMouseMove)
    window.addEventListener('mouseup', onCornerMouseUp)
    window.addEventListener('touchmove', onCornerMouseMove)
    window.addEventListener('touchend', onCornerMouseUp)
  }

  function onCornerMouseMove(event: MouseEvent | TouchEvent) {
    if (!isAdjusting.value || !cornerStart.value) {
      return
    }

    const pos = getMouseFromEvent(event)
    const { corner, startMouse, originalValue } = cornerStart.value

    const dx = pos.x - startMouse.x
    const dy = pos.y - startMouse.y

    let delta = 0

    // Determine the direction of adjustment based on corner
    switch (corner) {
      case 'e':
      case 'ne':
      case 'se':
        // East-facing corners: right increases value
        delta = dx
        break
      case 'w':
      case 'nw':
      case 'sw':
        // West-facing corners: left increases value
        delta = -dx
        break
      case 's':
        // South corner: down increases value
        delta = dy
        break
      case 'n':
        // North corner: up increases value
        delta = -dy
        break
    }

    // Apply inversion if needed
    if (isCornerInverted(corner)) {
      console.log('🚀 ~ onCornerMouseMove ~ corner:', corner)
      delta = -delta
    }

    // Calculate raw new value
    let newValue = originalValue + delta

    // Apply stepping if defined
    if (step && step > 0) {
      newValue = Math.round(newValue / step) * step
    }

    // Apply limits if defined
    const cornerLimits = limits?.[corner]
    if (cornerLimits) {
      if (cornerLimits.min !== undefined) {
        newValue = Math.max(cornerLimits.min!, newValue)
      }
      if (cornerLimits.max !== undefined) {
        newValue = Math.min(cornerLimits.max!, newValue)
      }
    }

    (corners.value as Record<Corner, number>)[corner] = newValue
  }

  function onCornerMouseUp() {
    isAdjusting.value = false
    activeCorner.value = null
    cornerStart.value = null
    enableTextSelection()

    window.removeEventListener('mousemove', onCornerMouseMove)
    window.removeEventListener('mouseup', onCornerMouseUp)
    window.removeEventListener('touchmove', onCornerMouseMove)
    window.removeEventListener('touchend', onCornerMouseUp)
  }

  return {
    isAdjusting,
    activeCorner,
    onCornerMouseDown,
  }
}
