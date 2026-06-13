import { klona } from 'klona/full'

// Types
import type { IActivePivotSplitter, IPivotSplitter } from '../types/pivot-splitter.type'

// Store
import { usePivotStore } from '../stores/pivot.store'

export function usePivotRowResizing<T extends IItem = IItem>() {
  const {
    rows,
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

  function getPivotRoot() {
    return unrefElement(pivotEl) ?? undefined
  }

  function getRowWidthPx(row: (typeof rows.value)[number]) {
    if (Number.isFinite(row._width) && row._width > 0) {
      return row._width
    }

    return row.getWidthPx(getPivotRoot())
  }

  const rowSplitters = computed(() => {
    const splitters: IPivotSplitter<T>[] = []

    if (!rows.value.length) {
      return splitters
    }

    let lastLeftPosition = 0

    rows.value.forEach(row => {
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
    const root = getPivotRoot()

    if (!root) {
      return
    }

    rows.value.forEach(row => {
      row._width = row.getWidthPx(root)
    })
  }

  function getMinRowWidth(row: (typeof rows.value)[number]) {
    return Math.max(row.minWidth, getResolvedMinimumColumnWidth())
  }

  function handleSplitterPointerDown(
    splitter: IPivotSplitter<T>,
    ev: PointerEvent,
  ) {
    const row = rows.value.find(r => r.field === splitter.field)

    if (!row) {
      return
    }

    const rowWidth = getRowWidthPx(row)
    row._width = rowWidth
    const splitterCopy = klona(omit(splitter, ['row']))
    const headerDom = unrefElement(rowHeaderEl)

    if (!headerDom) {
      return
    }

    const { y: headerY, height: headerHeight } = headerDom.getBoundingClientRect()
    const contentEl = getPivotRoot()?.querySelector('.virtual-scroll__content') as HTMLElement | null
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
  }

  function handleSplitterPointerMove(ev: PointerEvent) {
    const current = activeSplitter.value

    if (!current) {
      return
    }

    const left = Math.max(current.minLeft, ev.pageX)
    const adjustedWidth = current.originalWidth + left - pageX

    activeSplitter.value = {
      ...current,
      left,
      adjustedWidth,
    }
  }

  function handleSplitterPointerUp() {
    const current = activeSplitter.value

    if (!current) {
      return
    }

    document.documentElement.removeEventListener(
      'pointermove',
      handleSplitterPointerMove,
    )
    document.documentElement.removeEventListener(
      'pointerup',
      handleSplitterPointerUp,
    )

    const row = current.row
    const adjustedWidth = Math.max(
      current.adjustedWidth,
      getMinRowWidth(row),
    )

    activeSplitter.value = undefined

    nextTick(() => {
      document.documentElement.style.cursor = ''
      document.documentElement.style.userSelect = ''
    })

    if (!Number.isFinite(adjustedWidth)) {
      return
    }

    // Set the width
    row.setResizedWidth(adjustedWidth)

    // Trigger the reactivity and rerender the virtual scroll
    nextTick(() => {
      rows.value = [...rows.value]
      measureRowWidths()
      // rowsVirtualScrollEl.value?.rerender()
    })
  }

  return {
    activeSplitter,
    rowSplitters,
    measureRowWidths,
    handleSplitterPointerDown,
  }
}
