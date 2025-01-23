import { klona } from 'klona/full'

// Types
import type { IActiveTableSplitter, ITableSplitter } from '../types/table-splitter.type'

// Provide / Inject
import { tableSlotsKey } from '../provide/table.provide'

// Functions
import { stringToFloat } from '$utils'

// Store
import { useTableStore } from '../stores/table.store'

export function useTableColumnResizing() {
  const tableSlots = inject(tableSlotsKey)

  // Store
  const {
    virtualScrollEl,
    autofitConfig,
    rows,
    headerEl,
    minimumColumnWidth,
    internalColumns,
    visibleColumns,
  } = storeToRefs(useTableStore())

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

    // We need to move the last splitter a bit to the left so it doesn't create overflow
    // But only in case the last column is actually resizable
    const lastCol = visibleColumns.value[visibleColumns.value.length - 1]

    if (lastCol?.resizable && splitters.length) {
      splitters[splitters.length - 1]!.left -= 4
    }

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
      })

      // Trigger the reactivity on columns
      internalColumns.value = [...internalColumns.value]

      return
    }

    const splitterCopy = klona(omit(splitter, ['column']))
    // @ts-expect-error some weird type
    const headerDom = unrefElement(headerEl)!
    const { y: headerY, height: headerHeight } = headerDom.getBoundingClientRect()

    const { height: tableHeight }
      = (headerDom.parentElement!.querySelector('.virtual-scroll__content') as HTMLElement)
        .getBoundingClientRect()

    pageX = ev.pageX

    activeSplitter.value = {
      ...splitterCopy,
      left: pageX,
      minLeft: ev.pageX - colWidth + minimumColumnWidth.value - 4, // 4px is the middle of the splitter
      top: headerY,
      height: headerHeight + tableHeight,
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

    splitterJustClicked.value = true
  }

  function handleSplitterPointerMove(ev: PointerEvent) {
    if (activeSplitter.value) {
      activeSplitter.value.left = Math.max(
        activeSplitter.value.minLeft!,
        ev.pageX,
      )

      activeSplitter.value.adjustedWidth
        = activeSplitter.value.originalWidth
          + activeSplitter.value.left
          - pageX
    }
  }

  function handleSplitterPointerUp() {
    const col = activeSplitter.value!.column
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
    activeSplitter.value = undefined

    document.documentElement.removeEventListener(
      'pointermove',
      handleSplitterPointerMove,
    )
    document.documentElement.removeEventListener(
      'pointerup',
      handleSplitterPointerUp,
    )

    nextTick(() => {
      document.documentElement.style.cursor = ''
      document.documentElement.style.userSelect = ''

      // Trigger the reactivity on columns
      internalColumns.value = [...internalColumns.value]

      virtualScrollEl.value?.rerender()
    })
  }

  return {
    activeSplitter,
    columnSplitters,
    handleSplitterPointerDown,
  }
}
