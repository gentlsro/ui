// Store
import { useTableStore } from '../stores/table.store'

// Provide / Inject
import { tableMeasurementsKey } from '../provide/table.provide'

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

  const measurements = injectLocal(tableMeasurementsKey)!

  async function fitColumns(
    ev?: Partial<Pick<PointerEvent, 'shiftKey' | 'ctrlKey' | 'metaKey'>>,
    options?: { mode?: 'fit' | 'stretch' | 'justify' | 'fit-with-header' | null },
  ) {
    if (import.meta.server) {
      return
    }

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

    const scope = tableEl.value
    if (!scope?.isConnected) {
      return
    }

    const resizableColumns = visibleColumns.value
      .filter(col => col.resizable && !col.isHelperCol)
      .slice(0, 25)

    const helperColsWidth = internalColumns.value
      .filter(col => col.isHelperCol)
      .reduce((agg, col) => {
        const colWidth = col.getWidth(scope)
        agg += colWidth

        return agg
      }, 0)

    // Justify columns ~ will try to distribute the space evenly between all columns
    if (isJustify) {
      let colsTotalWidth = resizableColumns.reduce((agg, col) => {
        const colWidth = col.getWidth(scope)
        agg += colWidth

        return agg
      }, 0)

      const virtualScrollWidth = (virtualScrollEl.value?.element?.clientWidth ?? 0) - helperColsWidth

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
        await col.autoFit({
          rows: rows.value,
          measurements,
          tableMinColWidth: minimumColumnWidth.value,
          autofitConfig: { ...autofitConfig.value, mode },
          ui: uiConfig.value,
        })
        if (!scope.isConnected) {
          return
        }
      }

      const colsTotalWidth = resizableColumns.reduce((agg, col) => {
        const colWidth = col.getWidth(scope)
        agg += colWidth

        return agg
      }, 0)

      const virtualScrollWidth = (virtualScrollEl.value?.element?.clientWidth ?? 0) - helperColsWidth

      // If the columns are already wider than the table, we don't do anything
      if (colsTotalWidth > virtualScrollWidth) {
        return
      }

      resizableColumns.forEach(col => {
        const columnWidth = (virtualScrollWidth / colsTotalWidth) * col.getWidth(scope)
        const colWidth = Math.max(columnWidth, col.minWidth || 0, minimumColumnWidth.value)

        col.width = `${colWidth}px`
      })
    }

    // Fit columns ~ will try to fit the columns based on their content
    else {
      for await (const col of resizableColumns) {
        await col.autoFit({
          rows: rows.value,
          measurements,
          tableMinColWidth: minimumColumnWidth.value,
          autofitConfig: { ...autofitConfig.value, mode },
          ui: uiConfig.value,
        })
        if (!scope.isConnected) {
          return
        }
      }
    }

    // Trigger the reactivity on columns
    internalColumns.value = [...internalColumns.value]

    requestAnimationFrame(() => {
      if (scope.isConnected) {
        virtualScrollEl.value?.rerender(true)
      }
    })
  }

  return { fitColumns }
}
