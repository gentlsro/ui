import { useRafTask } from '#layers/utilities/app/composables/useRafTask'

import { klona } from 'klona/full'

// Types
import type { IActiveTableSplitter, ITableSplitter } from '../types/table-splitter.type'

// Provide / Inject
import { tableSlotsKey } from '../provide/table.provide'

// Store
import { useTableStore } from '../stores/table.store'

export function useTableColumnResizing() {
  const tableSlots = inject(tableSlotsKey)

  // Store
  const {
    tableEl,
    virtualScrollEl,
    autofitConfig,
    rows,
    headerEl,
    minimumColumnWidth,
    internalColumns,
    visibleColumns,
    uiConfig,
    emits,
  } = useTableStore()

  // Splitters (for resizing columns)
  let pageX = 0

  // State
  const splitterJustClicked = refAutoReset(false, 500)
  const activeSplitter = ref<IActiveTableSplitter>()

  const columnSplitters = computed(() => {
    const splitters: ITableSplitter[] = []

    if (!visibleColumns.value.length) {
      return splitters
    }

    let lastLeftPosition = 0

    visibleColumns.value
      .forEach(col => {
        const colWidth = col._width
        lastLeftPosition += colWidth

        if (col.isHelperCol || !col.resizable) {
          return
        }

        splitters.push({
          field: col.field as string,
          left: lastLeftPosition,
          column: col,
        })
      })

    return splitters
  })

  async function handleSplitterPointerDown(
    splitter: ITableSplitter,
    ev: PointerEvent,
  ) {
    const col = visibleColumns.value.find(c => c.field === splitter.field)

    if (!col) {
      return
    }

    const colWidth = col._width

    // Handle double-click ~ resize to fit
    if (col && splitterJustClicked.value) {
      const slotRenderFnc = tableSlots?.[col.field]

      await col.autoFit({
        rows: rows.value,
        slotRenderFnc,
        tableMinColWidth: minimumColumnWidth.value,
        autofitConfig: autofitConfig.value,
        ui: uiConfig.value,
      })

      // Trigger the reactivity on columns
      internalColumns.value = [...internalColumns.value]

      return
    }

    const splitterCopy = klona(omit(splitter, ['column']))
    const headerDom = headerEl.value?.element
    if (!headerDom) {
      return
    }
    const { y: headerY, height: headerHeight } = headerDom.getBoundingClientRect()

    // The content can span thousands of offscreen rows. End the guide at the
    // scroll viewport instead, above the table footer.
    const bodyRect = virtualScrollEl.value?.element?.getBoundingClientRect()

    const guideHeight = bodyRect
      ? Math.max(headerHeight, bodyRect.bottom - headerY)
      : headerHeight

    pageX = ev.pageX

    activeSplitter.value = {
      ...splitterCopy,
      left: pageX,
      minLeft: ev.pageX - colWidth + minimumColumnWidth.value - 4, // 4px is the middle of the splitter
      top: headerY,
      height: guideHeight,
      column: col!,
      adjustedWidth: colWidth,
      originalWidth: colWidth,
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

    splitterJustClicked.value = true
  }

  const resizeFrame = useRafTask(updateSplitterPosition)

  function handleSplitterPointerMove(ev: PointerEvent) {
    resizeFrame.schedule(ev.pageX)
  }

  function updateSplitterPosition(pointerX: number) {
    if (activeSplitter.value) {
      activeSplitter.value.left = Math.max(
        activeSplitter.value.minLeft!,
        pointerX,
      )

      activeSplitter.value.adjustedWidth
        = activeSplitter.value.originalWidth
          + activeSplitter.value.left
          - pageX
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
  watch(tableEl, element => {
    if (!element) {
      cancelResize()
    }
  }, { flush: 'sync' })

  function handleSplitterPointerUp() {
    resizeFrame.flush()
    if (!activeSplitter.value) {
      return
    }

    const col = activeSplitter.value.column
    const colIdx = visibleColumns.value.findIndex(c => c.field === col.field)

    const diff
      = activeSplitter.value!.adjustedWidth
        - activeSplitter.value!.originalWidth

    // If the currently resized column is `semiFrozen` but not `frozen`,
    // we need to adjust the widths of all the `semiFrozen` columns that come
    // after it
    if (
      activeSplitter.value!.column.semiFrozen
      && !activeSplitter.value!.column.frozen
    ) {
      const lastSemiFrozenColIdx = visibleColumns.value
        .slice(colIdx)
        .findIndex(col => !col.semiFrozen)

      const semiFrozenColumns = visibleColumns.value.slice(
        colIdx + 1,
        colIdx + lastSemiFrozenColIdx,
      )

      semiFrozenColumns.forEach(col => {
        if (typeof col.headerStyle.left === 'string') {
          const left = Number(stringToFloat(col.headerStyle.left) || 0)

          col.headerStyle.left = `${left + diff}px`
        }
      })
    }

    // Set the width of the column we're resizing to the new width
    col.width = `${activeSplitter.value!.adjustedWidth}px`

    // Reset the active splitter
    const width = activeSplitter.value!.adjustedWidth
    cancelResize()

    nextTick(() => {
      // Trigger the reactivity on columns
      internalColumns.value = [...internalColumns.value]

      virtualScrollEl.value?.rerender()
      emits.value.columnResize({
        column: col,
        columns: visibleColumns.value,
        width,
      })
    })
  }

  return {
    activeSplitter,
    columnSplitters,
    handleSplitterPointerDown,
  }
}
