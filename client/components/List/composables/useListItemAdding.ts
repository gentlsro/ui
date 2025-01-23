// Store
import { listHandleAddSearch } from '../functions/list-handle-add-search'
import { useListStore } from '../stores/list.store'

export function useListItemAdding() {
  const listStore = useListStore()
  const {
    addConfig,
    preAddedItem,
    hasExactMatch,
    search,
    $zAddItem,
  } = storeToRefs(listStore)

  function handleSearch() {
    listHandleAddSearch({
      search: search.value,
      preAddedItem,
      hasExactMatch: hasExactMatch.value,
      addConfig: addConfig.value,
      itemLabel: listStore.itemLabel,
      $z: $zAddItem,
    })
  }

  watch(search, handleSearch)
}
