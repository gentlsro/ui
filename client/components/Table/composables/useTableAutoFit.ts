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
    virtualScrollEl,
    visibleColumns,
    uiConfig,
  } = storeToRefs(useTableStore())

  const tableSlots = injectLocal(tableSlotsKey)

  async function fitColumns(
    ev?: Partial<Pick<PointerEvent, 'shiftKey' | 'ctrlKey' | 'metaKey'>>,
    options?: { mode?: 'fit' | 'stretch' | 'justify' | 'fit-with-header' },
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

    const resizableColumns = visibleColumns.value.filter(col => col.resizable && !col.isHelperCol)
    const helperColsWidth = internalColumns.value
      .filter(col => col.isHelperCol)
      .reduce((agg, col) => {
        const colWidth = col.getWidth()
        agg += colWidth

        return agg
      }, 0)

    // Justify columns ~ will try to distribute the space evenly between all columns
    if (isJustify) {
      let colsTotalWidth = resizableColumns.reduce((agg, col) => {
        const colWidth = col.getWidth()
        agg += colWidth

        return agg
      }, 0)

      const virtualScrollWidth = (unrefElement(virtualScrollEl.value)?.clientWidth ?? 0) - helperColsWidth

      colsTotalWidth = Math.max(colsTotalWidth, virtualScrollWidth)
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
          autofitConfig: autofitConfig.value,
          ui: uiConfig.value,
        })
      }

      const colsTotalWidth = resizableColumns.reduce((agg, col) => {
        const colWidth = col.getWidth()
        agg += colWidth

        return agg
      }, 0)

      const virtualScrollWidth = (unrefElement(virtualScrollEl.value)?.clientWidth ?? 0) - helperColsWidth

      // If the columns are already wider than the table, we don't do anything
      if (colsTotalWidth > virtualScrollWidth) {
        return
      }

      resizableColumns.forEach(col => {
        const columnWidth = (virtualScrollWidth / colsTotalWidth) * col.getWidth()
        const colWidth = Math.max(columnWidth, col.minWidth || 0, minimumColumnWidth.value)

        col.width = `${colWidth}px`
      })
    }

    // Fit columns ~ will try to fit the columns based on their content
    else {
      for await (const col of resizableColumns) {
        const slotRenderFnc = tableSlots?.[col.field]

        await col.autoFit({
          rows: rows.value,
          slotRenderFnc,
          tableMinColWidth: minimumColumnWidth.value,
          autofitConfig: {
            ...autofitConfig.value,
            considerHeader: mode === 'fit-with-header',
          },
          ui: uiConfig.value,
        })
      }
    }

    // Trigger the reactivity on columns
    internalColumns.value = [...internalColumns.value]
  }

  return { fitColumns }
}
