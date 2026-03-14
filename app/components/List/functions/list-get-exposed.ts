// Functions
import { useListKeyboard } from '../composables/useListKeyboard'

// Store
import { useListStore } from '../stores/list.store'

export function listGetExposed() {
  const store = useListStore()
  const { listItems, refreshTrigger } = store
  const { handleKey } = useListKeyboard({ registerKeyStroke: false })

  return {
    handleKey,
    refresh: () => refreshTrigger.value++,
    getListItems: () => listItems.value,
    store: () => store,
  }
}
