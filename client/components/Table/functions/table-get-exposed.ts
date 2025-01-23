// Store
import { useTableStore } from '../stores/table.store'

export function tableGetExposed() {
  const tableStore = useTableStore()

  return {
    refetch: tableStore.fetchAndSetData,
  }
}
