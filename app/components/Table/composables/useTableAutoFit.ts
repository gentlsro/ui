// Store
import { useTableStore } from '../stores/table.store'

// Provide / Inject
import { tableSlotsKey } from '../provide/table.provide'

export function useTableAutoFit() {
  // Store
  const { uiState } = storeToRefs(useUIStore())
  const {
    autofitConfig,
    rows,
    internalColumns,
    minimumColumnWidth,
    tableEl,
    virtualScrollEl,
    visibleColumns,
    uiConfig,
  } = useTableStore()

  const tableSlots = injectLocal(tableSlotsKey)

  async function fitColumns(
    ev?: Partial<Pick<PointerEvent, 'shiftKey' | 'ctrlKey' | 'metaKey'>>,
    options?: { mode?: 'fit' | 'stretch' | 'justify' | 'fit-with-header' | null },
  ) {
    const { mode = uiState.value.table?.fit } = options ?? {}
    if (!ev && !mode) {
      return
    }

    let isStretch = mode === 'stretch'
    let isJustify = mode === 'justify'

    if (ev) {
      isStretch = !!ev?.shiftKey
      isJustify = !!(ev?.ctrlKey || ev?.metaKey)
    }

    const scope = unrefElement(tableEl.value) ?? document

    const resizableColumns = visibleColumns.value
      .filter(col => col.resizable && !col.isHelperCol)
      .slice(0, 25)

    // Empty tables render .table-empty instead of the row scroller.
    const containerEl = unrefElement(virtualScrollEl.value)
      ?? scope.querySelector('.table-empty')
      ?? scope

    const fixedColsWidth = [
      ...internalColumns.value.filter(col => col.isHelperCol),
      ...visibleColumns.value.filter(col => !col.resizable && !col.isHelperCol),
    ].reduce((agg, col) => agg + col.getWidth(scope), 0)

    const availableWidth = ((containerEl as Element).clientWidth ?? 0) - fixedColsWidth

    // Justify columns ~ will try to distribute the space evenly between all columns
    if (isJustify) {
      let colsTotalWidth = resizableColumns.reduce((agg, col) => {
        const colWidth = col.getWidth(scope)
        agg += colWidth

        return agg
      }, 0)

      colsTotalWidth = Math.max(colsTotalWidth, availableWidth)
      const columnWidth = colsTotalWidth / resizableColumns.length

      resizableColumns.forEach(col => {
        const colWidth = Math.max(columnWidth, col.minWidth || 0, minimumColumnWidth.value)

        col.width = `${colWidth}px`
      })
    }

    // Stretch columns ~ will try to fit the columns based on their content and then stretch it
    // across the available table width
    else if (isStretch) {
      for await (const col of resizableColumns) {
        const slotRenderFnc = tableSlots?.[col.field]

        await col.autoFit({
          rows: rows.value,
          slotRenderFnc,
          tableMinColWidth: minimumColumnWidth.value,
          autofitConfig: { ...autofitConfig.value, mode },
          ui: uiConfig.value,
        })
      }

      // autoFit updates col.width before the DOM reflects the new width.
      const widths = resizableColumns.map(col => col.width?.endsWith('px')
        ? Number.parseFloat(col.width)
        : col.getWidth(scope))

      const colsTotalWidth = widths.reduce((agg, width) => agg + width, 0)

      // Keep existing widths if the columns already fill the table.
      if (colsTotalWidth && colsTotalWidth < availableWidth) {
        resizableColumns.forEach((col, index) => {
          const columnWidth = (availableWidth / colsTotalWidth) * widths[index]!
          const colWidth = Math.max(columnWidth, col.minWidth || 0, minimumColumnWidth.value)

          col.width = `${colWidth}px`
        })
      }
    }

    // Fit columns ~ will try to fit the columns based on their content
    else {
      for await (const col of resizableColumns) {
        const slotRenderFnc = tableSlots?.[col.field]

        await col.autoFit({
          rows: rows.value,
          slotRenderFnc,
          tableMinColWidth: minimumColumnWidth.value,
          autofitConfig: { ...autofitConfig.value, mode },
          ui: uiConfig.value,
        })
      }
    }

    // Trigger the reactivity on columns
    internalColumns.value = [...internalColumns.value]

    requestAnimationFrame(() => {
      virtualScrollEl.value?.rerender(true)
    })
  }

  return { fitColumns }
}
