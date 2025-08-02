import type { Required } from 'utility-types'

// Types
import type { ITableLayout } from '../types/table-layout.type'

// Functions
import { useTableAutoFit } from '../composables/useTableAutoFit'
import type { tableBuildFetchPayload } from './table-build-fetch-payload'

// Store
import { tableSelectRow } from './table-select-row'
import { useTableStore } from '../stores/table.store'
import { tableApplyLayout } from './table-apply-layout'

export function tableGetExposed() {
  const { fitColumns } = useTableAutoFit()
  const tableStore = useTableStore()
  const { rowKey, selectionConfig, selection, selectionByKey } = toRefs(tableStore)

  return {
    refetch: tableStore.fetchAndSetData,
    store: () => tableStore,
    fitColumns,
    applyLayout: (payload: { layout?: ITableLayout }) => tableApplyLayout({
      ...payload,
      getStore: () => tableStore,
    }),
    getFetchPayload: (payload?: Partial<Parameters<typeof tableBuildFetchPayload>[0]>) => tableStore.getFetchPayload(payload),
    getVirtualScroller: () => tableStore.virtualScrollEl,
    selectRow: (payload: Required<Partial<Parameters<typeof tableSelectRow>[0]>, 'row'>) => {
      const _payload = {
        ...payload,
        selection: payload.selection ?? selection,
        selectionByKey: payload.selectionByKey ?? (selectionByKey as unknown as Record<string, boolean>),
        selectionConfig: payload.selectionConfig ?? selectionConfig.value,
        rowKey: payload.rowKey ?? rowKey.value,
      }

      tableSelectRow(_payload)
    },
    cancelEdit: () => tableStore.cancelCellEdit(),
  }
}
