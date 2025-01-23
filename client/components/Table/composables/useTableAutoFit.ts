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
  } = storeToRefs(useTableStore())

  const tableSlots = inject(tableSlotsKey)

  async function fitColumns(ev?: Partial<Pick<PointerEvent, 'shiftKey' | 'ctrlKey' | 'metaKey'>>) {
    if (!ev && !uiState.value.table?.fit) {
      return
    }

    let isStretch = uiState.value.table?.fit === 'stretch'
    let isJustify = uiState.value.table?.fit === 'justify'

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
    // Fit columns ~ will try to fit the columns based on their content
    else {
      for await (const col of resizableColumns) {
        const slotRenderFnc = tableSlots?.[col.field]

        await col.autoFit({
          rows: rows.value,
          slotRenderFnc,
          tableMinColWidth: minimumColumnWidth.value,
          autofitConfig: autofitConfig.value,
        })
      }
    }

    // Trigger the reactivity on columns
    internalColumns.value = [...internalColumns.value]
  }

  return { fitColumns }
}
