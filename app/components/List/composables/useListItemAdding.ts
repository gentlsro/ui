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
    addItemArk,
  } = useListStore()

  function handleSearch() {
    listHandleAddSearch({
      search: search.value,
      preAddedItem,
      hasExactMatch: hasExactMatch.value,
      addConfig: addConfig.value,
      itemLabel: itemLabel.value,
      validation: addItemArk,
    })
  }

  watch(search, handleSearch)
}
