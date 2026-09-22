// Functions
import { useListKeyboard } from '../composables/useListKeyboard'

// Store
import { useListStore } from '../stores/list.store'

export type IListRefreshOptions = {
  /**
   * When `true`, the data is re-fetched via `loadData.fnc` (even if `search` did not change)
   * instead of only rebuilding the list items from the current `items`.
   * Falls back to the local rebuild when no `loadData.fnc` is configured.
   */
  reloadData?: boolean
}

export function listGetExposed() {
  const store = useListStore()
  const { listItems, refreshTrigger, loadData, fetchAndSetData } = store
  const { handleKey } = useListKeyboard({ registerKeyStroke: false })

  async function refresh(options?: IListRefreshOptions) {
    if (options?.reloadData && loadData.value?.fnc) {
      // `fetchAndSetData` reassigns `items`, which triggers the list rebuild
      await fetchAndSetData({ isFetchMore: false, force: true })

      return
    }

    refreshTrigger.value++
  }

  return {
    handleKey,
    refresh,
    getListItems: () => listItems.value,
    store: () => store,
  }
}
