// Functions
import { useListKeyboard } from '../composables/useListKeyboard'

// Store
import { useListStore } from '../stores/list.store'

export function listGetExposed(onSubmit: () => void) {
  const store = useListStore()
  const { listItems, refreshTrigger } = store
  const { handleKey } = useListKeyboard({ onSubmit, registerKeyStroke: false })

  return {
    element: store.containerEl,
    handleKey,
    refresh: () => refreshTrigger.value++,
    getListItems: () => listItems.value,
    store: () => store,
  }
}
