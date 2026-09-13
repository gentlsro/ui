import { useRafTask } from '#layers/utilities/app/composables/useRafTask'

// Store
import { useQueryBuilderStore } from '../query-builder.store'

// Constants
const GROUP_ROW_TITLE_HEIGHT = 38
const GROUP_ROW_CONTROLS_HEIGHT = -38

export function useQueryBuilderDragAndDrop() {
  // Store
  const {
    queryBuilderEl,
    draggedItem,
  } = useQueryBuilderStore()

  const scrollFrame = useRafTask(handleDragging)
  function schedulePosition() {
    if (draggedItem.value) {
      scrollFrame.schedule(undefined)
    }
  }

  // Fixed coordinates must follow both the inner viewport and scrolling ancestors.
  useEventListener('scroll', schedulePosition, { capture: true, passive: true })
  useEventListener('resize', schedulePosition)

  function handleDragging() {
    const pos = draggedItem.value?.pos

    if (!pos) {
      return
    }

    // Define positions for later use
    const posX = pos.x ?? 0
    const posY = pos.y ?? 0

    // Get all elements from the point where we are dragging the item
    // and get the dragged-over query builder row
    const els = document.elementsFromPoint(posX, posY)
    let qbRow = els.find(el => el.classList.contains('qb-row') && queryBuilderEl.value?.contains(el)) as HTMLElement | undefined

    // The browser can scroll an ancestor while the pointer is held at a viewport
    // edge. Keep the drop target attached to the nearest row instead of leaving
    // an indicator at its pre-scroll coordinates.
    if (!qbRow && queryBuilderEl.value) {
      const rows = Array.from(queryBuilderEl.value.querySelectorAll<HTMLElement>('.qb-row'))
      const itemRows = rows.filter(row => row.classList.contains('qb-item'))

      const nearestRows = (itemRows.length ? itemRows : rows)
        .filter(row => {
          const rect = row.getBoundingClientRect()

          return posX >= rect.left && posX <= rect.right
        })
        .map(row => {
          const rect = row.getBoundingClientRect()
          const distance = posY < rect.top
            ? rect.top - posY
            : posY > rect.bottom ? posY - rect.bottom : 0

          return { row, distance, height: rect.height }
        })
        .sort((a, b) => a.distance - b.distance || a.height - b.height)

      qbRow = nearestRows[0]?.row
    }
    const qbRowPath = qbRow?.dataset.path

    // When no query builder row is found, we don't really do anything
    // We also do nothing when we're dragging over the same row
    // We also do nothing when we're dragging over descendants of the dragged item (only if nested)
    if (
      !qbRow
      || qbRow.classList.contains('no-dragover')
      || qbRowPath === draggedItem.value?.row.path
      || qbRowPath?.startsWith(`${draggedItem.value?.row.path}.children.`)
    ) {
      return
    }

    // When hovering over group, we need to adjust the position of drop
    // indicator a bit because the group also has a controls row and the title row
    const isGroup = qbRow?.classList.contains('qb-group')

    const {
      x: rowX,
      y: rowY,
      height: rowHeight,
      width: rowWidth,
    } = qbRow.getBoundingClientRect()

    const isAbove = (posY - rowY) / rowHeight < 0.5
    const targetY = isAbove
      ? rowY + (isGroup ? GROUP_ROW_TITLE_HEIGHT : 0)
      : rowY + rowHeight + (isGroup ? GROUP_ROW_CONTROLS_HEIGHT : 0)
    const scroller = queryBuilderEl.value!
    const viewport = scroller.getBoundingClientRect()
    const viewportLeft = viewport.left + scroller.clientLeft
    const viewportTop = viewport.top + scroller.clientTop

    // A root group can extend beyond the scroller. Keep its marker at the visible edge,
    // while leaving space for the arrow outside the line and inside the browser viewport.
    const left = Math.max(rowX, viewportLeft, 20)
    const right = Math.min(rowX + rowWidth, viewportLeft + scroller.clientWidth, window.innerWidth)
    const top = Math.max(viewportTop, 12)
    const bottom = Math.min(viewportTop + scroller.clientHeight - 2, window.innerHeight - 12)
    draggedItem.value!.dropIndicatorPos = {
      x: left,
      y: Math.max(top, Math.min(targetY, bottom)),
      width: Math.max(0, right - left),
    }
    draggedItem.value!.dropDirection = isAbove ? 'above' : 'below'

    draggedItem.value!.newPathIsGroup = isGroup
    draggedItem.value!.newPath = qbRow.dataset.path
  }

  whenever(
    () => draggedItem.value?.pos,
    () => {
      scrollFrame.cancel()
      handleDragging()
    },
    // The row already batches movement in RAF; resolve the drop before mouseup commits it.
    { flush: 'sync' },
  )
}
