import { Draggable, PointerSensor } from 'dragdoll'

// @vapor-ready — native handles and scope-owned Dragdoll registration.

// Types
import type { ICornerResizeProps } from '../types/corner-resize-props.type'

type Corner = 'nw' | 'n' | 'ne' | 'w' | 'e' | 'sw' | 's' | 'se'

type CornerLimits = { min?: number, max?: number }

type CornerStart = {
  corner: Corner
  startMouse: { x: number, y: number }
  originalValue: number
}

export function useCornerAdjustment(payload: {
  corners: Ref<ICornerResizeProps['modelValue']>
  handles: Readonly<Ref<HTMLElement | null | undefined>>
  limits?: Partial<Record<Corner, CornerLimits>>
  step?: number | null
  inverted?: boolean | Partial<Record<Corner, boolean>>
}) {
  const {
    corners,
    handles,
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

  watch(handles, (element, _, onCleanup) => {
    if (!element) {
      return
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
        corner = event.target instanceof Element
          ? event.target.closest<HTMLElement>('[data-adjust-corner]')?.dataset.adjustCorner as Corner | undefined
          : undefined
        if (!corner || !(corner in (corners.value ?? {}))) {
          return false
        }
        event.preventDefault()

        return true
      },
    })
    const draggable = new Draggable([sensor], {
      // Vue updates the values; Dragdoll samples pointer movement in RAF.
      elements: () => [],
      startPredicate: () => true,
      onStart: drag => {
        previousUserSelect = document.body.style.userSelect
        document.body.style.userSelect = 'none'
        cornerStart.value = {
          corner: corner!,
          startMouse: { x: drag.startEvent.x, y: drag.startEvent.y },
          originalValue: corners.value?.[corner!] ?? 0,
        }
        isAdjusting.value = true
        activeCorner.value = corner!
      },
      onMove: drag => updateCorner(drag.moveEvent),
      onEnd: drag => {
        // Commit the release position even when its sampled frame has not run yet.
        if (drag.endEvent?.type === 'end') {
          updateCorner(drag.endEvent)
        }
        isAdjusting.value = false
        activeCorner.value = null
        cornerStart.value = null
        document.body.style.userSelect = previousUserSelect
      },
    })
    onCleanup(() => {
      sensor.cancel()
      draggable.destroy()
      sensor.destroy()
    })
  }, { immediate: true, flush: 'post' })

  function updateCorner(pos: { x: number, y: number }) {
    if (!isAdjusting.value || !cornerStart.value) {
      return
    }

    const { corner, startMouse, originalValue = 0 } = cornerStart.value

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

    (corners.value as Record<Corner, number>) = {
      ...(corners.value as Record<Corner, number>),
      [corner]: newValue,
    }
  }

  return { isAdjusting, activeCorner }
}
