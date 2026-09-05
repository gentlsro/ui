import { useRafTask } from '#layers/utilities/app/composables/useRafTask'

import { klona } from 'klona/full'

// Types
import type { IActivePivotSplitter, IPivotSplitter } from '../types/pivot-splitter.type'

// Store
import { usePivotStore } from '../stores/pivot.store'

export function usePivotRowResizing<T extends IItem = IItem>() {
  const {
    displayRowFields,
    items,
    pivotEl,
    rowHeaderEl,
    rowsVirtualScrollEl,
    minimumColumnWidth,
  } = usePivotStore<T>()

  let pageX = 0

  const activeSplitter = ref<IActivePivotSplitter<T>>()

  function getResolvedMinimumColumnWidth() {
    const value = Number(minimumColumnWidth.value)

    return Number.isFinite(value) ? value : 80
  }

  function getRowWidthPx(row: (typeof displayRowFields.value)[number]) {
    if (Number.isFinite(row._width) && row._width > 0) {
      return row._width
    }

    return row.getWidthPx(pivotEl.value)
  }

  const rowSplitters = computed(() => {
    const splitters: IPivotSplitter<T>[] = []

    if (!displayRowFields.value.length) {
      return splitters
    }

    let lastLeftPosition = 0

    displayRowFields.value.forEach(row => {
      const rowWidth = getRowWidthPx(row)
      lastLeftPosition += rowWidth

      if (!row.resizable) {
        return
      }

      splitters.push({
        field: row.field,
        left: lastLeftPosition,
        row,
      })
    })

    return splitters
  })

  function measureRowWidths() {
    const root = pivotEl.value

    if (!root) {
      return
    }

    displayRowFields.value.forEach(row => {
      row._width = row.getWidthPx(root)
    })
  }

  function getMinRowWidth(row: (typeof displayRowFields.value)[number]) {
    return Math.max(row.minWidth, getResolvedMinimumColumnWidth())
  }

  function handleSplitterPointerDown(
    splitter: IPivotSplitter<T>,
    ev: PointerEvent,
  ) {
    const row = displayRowFields.value.find(r => r.field === splitter.field)

    if (!row) {
      return
    }

    const rowWidth = getRowWidthPx(row)
    row._width = rowWidth
    const splitterCopy = klona(omit(splitter, ['row']))
    const headerDom = rowHeaderEl.value

    if (!headerDom) {
      return
    }

    const { y: headerY, height: headerHeight } = headerDom.getBoundingClientRect()
    const contentEl = pivotEl.value?.querySelector('.virtual-scroll__content') as HTMLElement | null
    const { height: contentHeight } = contentEl?.getBoundingClientRect() ?? { height: 0 }

    pageX = ev.pageX

    activeSplitter.value = {
      ...splitterCopy,
      left: pageX,
      minLeft: ev.pageX - rowWidth + getMinRowWidth(row) - 4,
      top: headerY,
      height: headerHeight + contentHeight,
      row,
      adjustedWidth: rowWidth,
      originalWidth: rowWidth,
    }

    document.documentElement.style.cursor = 'col-resize'
    document.documentElement.style.userSelect = 'none'

    document.documentElement.addEventListener(
      'pointermove',
      handleSplitterPointerMove,
    )
    document.documentElement.addEventListener(
      'pointerup',
      handleSplitterPointerUp,
    )
    document.documentElement.addEventListener('pointercancel', cancelResize)
  }

  const resizeFrame = useRafTask(updateSplitterPosition)

  function handleSplitterPointerMove(ev: PointerEvent) {
    resizeFrame.schedule(ev.pageX)
  }

  function updateSplitterPosition(pointerX: number) {
    const current = activeSplitter.value

    if (!current) {
      return
    }

    const left = Math.max(current.minLeft, pointerX)
    const adjustedWidth = current.originalWidth + left - pageX

    activeSplitter.value = {
      ...current,
      left,
      adjustedWidth,
    }
  }

  // Cancellation releases document listeners without committing the pending width.
  function cancelResize() {
    resizeFrame.cancel()
    if (!activeSplitter.value) {
      return
    }

    activeSplitter.value = undefined
    document.documentElement.removeEventListener('pointermove', handleSplitterPointerMove)
    document.documentElement.removeEventListener('pointerup', handleSplitterPointerUp)
    document.documentElement.removeEventListener('pointercancel', cancelResize)
    document.documentElement.style.cursor = ''
    document.documentElement.style.userSelect = ''
  }

  onBeforeUnmount(cancelResize)
  // The owner root can disappear across interop before this header is unmounted.
  watch(pivotEl, element => {
    if (!element) {
      cancelResize()
    }
  }, { flush: 'sync' })

  function handleSplitterPointerUp() {
    resizeFrame.flush()
    const current = activeSplitter.value

    if (!current) {
      return
    }

    const row = current.row
    const adjustedWidth = Math.max(current.adjustedWidth, getMinRowWidth(row))
    cancelResize()

    if (!Number.isFinite(adjustedWidth)) {
      return
    }

    row.setResizedWidth(adjustedWidth)

    nextTick(() => {
      items.value = [...items.value]
      rowsVirtualScrollEl.value?.rerender()
    })
  }

  return {
    activeSplitter,
    rowSplitters,
    measureRowWidths,
    handleSplitterPointerDown,
  }
}
