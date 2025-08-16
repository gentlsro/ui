// Functions
import { useListKeyboard } from '../composables/useListKeyboard'

// Store
import { useListStore } from '../stores/list.store'

export function listGetExposed() {
  const listStore = useListStore()
  const { listItems, recalculationTrigger } = storeToRefs(listStore)
  const { handleKey } = useListKeyboard({ registerKeyStroke: false })

  return {
    handleKey,
    recalculate: () => recalculationTrigger.value++,
    getListItems: () => listItems.value,
    store: () => listStore,
  }
}
