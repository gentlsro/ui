import type { Required } from 'utility-types'

// Functions
import { useTableAutoFit } from '../composables/useTableAutoFit'

// Store
import { useTableStore } from '../stores/table.store'
import { tableSelectRow } from './table-select-row'

export function tableGetExposed() {
  const { fitColumns } = useTableAutoFit()
  const tableStore = useTableStore()
  const { rowKey, selectionConfig, selection, selectionByKey } = toRefs(tableStore)

  return {
    refetch: tableStore.fetchAndSetData,
    store: () => tableStore,
    fitColumns,
    getFetchPayload: () => tableStore.getFetchPayload(),
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
  }
}
