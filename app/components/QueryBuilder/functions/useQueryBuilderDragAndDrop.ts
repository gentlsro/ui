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

  const { y: scrollY } = useScroll(queryBuilderEl, {
    onScroll: () => handleDragging(),
  })

  /**
   * In the gaps between rows the pointer is over the group itself; below the
   * group's own header that means "between its children", so the closest child
   * row is the target (otherwise the indicator jumps to the group's edge)
   */
  function resolveHoveredRow(row: HTMLElement | undefined, posY: number) {
    if (!row?.classList.contains('qb-group')) {
      return row
    }

    const headerBottom = row.querySelector(':scope > .qb-group-row')?.getBoundingClientRect().bottom ?? 0
    const children = [...row.querySelectorAll<HTMLElement>(':scope > .qb-row')]

    // Over the root's header there is nothing to drop next to, so it means
    // "at the top", i.e. above its first child
    if (posY <= headerBottom) {
      return row.classList.contains('is-base') ? (children[0] ?? row) : row
    }

    return children.reduce<HTMLElement | undefined>((closest, child) => {
      const distance = (el: HTMLElement) => {
        const { top, bottom } = el.getBoundingClientRect()

        return posY < top ? top - posY : Math.max(0, posY - bottom)
      }

      return !closest || distance(child) < distance(closest) ? child : closest
    }, undefined) ?? row
  }

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
    const qbRow = resolveHoveredRow(
      els.find(el => el.classList.contains('qb-row')) as HTMLElement | undefined,
      posY,
    )
    const qbRowPath = qbRow?.dataset.path

    // When no query builder row is found, we don't really do anything
    // We also do nothing when we're dragging over the same row
    // We also do nothing when we're dragging over descendants of the dragged item (only if nested)
    if (
      !qbRow
      || qbRow.classList.contains('no-dragover')
      || qbRowPath === draggedItem.value?.row.path
      || (qbRowPath?.includes('.') && qbRowPath?.startsWith(draggedItem.value?.row.path || ''))
    ) {
      return
    }

    // Measured on every move: a cached rect goes stale (e.g. taken while the
    // dialog was still animating in), which offsets the drop indicator
    const containerRect = queryBuilderEl.value?.getBoundingClientRect()
    const containerX = containerRect?.x ?? 0
    const containerY = containerRect?.y ?? 0

    // When hovering over group, we need to adjust the position of drop
    // indicator a bit because the group also has a controls row and the title row
    const isGroup = qbRow?.classList.contains('qb-group')

    const {
      x: rowX,
      y: rowY,
      height: rowHeight,
      width: rowWidth,
    } = qbRow.getBoundingClientRect()

    // const relativePositionX = (posX - rowX) / rowWidth
    const relativePositionY = (posY - rowY) / rowHeight

    // When we hover in top side of the item, we indicate that we want to
    // drop the dragged item before the hovered item
    if (relativePositionY < 0.5) {
      const offset = {
        x: 0,
        y: isGroup ? GROUP_ROW_TITLE_HEIGHT : 0,
      }

      draggedItem.value!.dropIndicatorPos = {
        x: rowX + offset.x - containerX,
        y: rowY + offset.y + scrollY.value - containerY,
        width: rowWidth,
      }

      draggedItem.value!.dropDirection = 'above'
    }

    // When we hover in bottom side of the item, we indicate that we want to
    // drop the dragged item below the hovered item
    else {
      const offset = {
        x: 0,
        y: isGroup ? GROUP_ROW_CONTROLS_HEIGHT : 0,
      }

      draggedItem.value!.dropIndicatorPos = {
        x: rowX + offset.x - containerX,
        y:
          rowY
          + offset.y
          + scrollY.value
          + rowHeight
          - containerY,
        width: rowWidth,
      }

      draggedItem.value!.dropDirection = 'below'
    }

    draggedItem.value!.newPathIsGroup = isGroup
    draggedItem.value!.newPath = qbRow.dataset.path
  }

  whenever(
    () => draggedItem.value?.pos,
    () => handleDragging(),
  )
}
