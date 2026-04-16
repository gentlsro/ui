// Store
import { useTreeStore } from '../stores/tree.store'

export function treeGetExposed() {
  const treeStore = useTreeStore()
  const { nodes, searchEl } = storeToRefs(treeStore)

  return {
    nodes,
    focusSearch: () => searchEl.value?.focus(),
    selectSearch: () => searchEl.value?.select(),
    clearSearch: () => searchEl.value?.clear(),
    collapseAll: treeStore.collapseAll,
    expandAll: treeStore.expandAll,
    store: () => treeStore,
  }
}
