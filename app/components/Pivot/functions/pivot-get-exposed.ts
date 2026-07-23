// Store
import { usePivotStore } from '../stores/pivot.store'

export function pivotGetExposed() {
  const pivotStore = usePivotStore()

  return {
    refetch: pivotStore.fetchAndSetData,
    store: () => pivotStore,
  }
}
