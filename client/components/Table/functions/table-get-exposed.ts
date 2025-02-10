// Functions
import { useTableAutoFit } from '../composables/useTableAutoFit'

// Store
import { useTableStore } from '../stores/table.store'

export function tableGetExposed() {
  const { fitColumns } = useTableAutoFit()
  const tableStore = useTableStore()

  return {
    refetch: tableStore.fetchAndSetData,
    store: () => tableStore,
    fitColumns,
    getFetchPayload: () => tableStore.getFetchPayload(),
    getVirtualScroller: () => tableStore.virtualScrollEl,
  }
}
