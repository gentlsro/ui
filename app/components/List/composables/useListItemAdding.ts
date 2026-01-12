// Store
import { listHandleAddSearch } from '../functions/list-handle-add-search'
import { useListStore } from '../stores/list.store'

export function useListItemAdding() {
  const {
    itemLabel,
    addConfig,
    preAddedItem,
    hasExactMatch,
    search,
    $zAddItem,
  } = useListStore()

  function handleSearch() {
    listHandleAddSearch({
      search: search.value,
      preAddedItem,
      hasExactMatch: hasExactMatch.value,
      addConfig: addConfig.value,
      itemLabel: itemLabel.value,
      $z: $zAddItem,
    })
  }

  watch(search, handleSearch)
}
