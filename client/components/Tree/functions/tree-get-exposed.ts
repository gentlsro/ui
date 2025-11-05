// Store
import { useTreeStore } from '../stores/tree.store'

export function treeGetExposed() {
  const treeStore = useTreeStore()
  const { nodes, searchEl } = storeToRefs(treeStore)

  return {
    nodes,
    focusSearch: () => searchEl.value?.focus(),
    collapseAll: treeStore.collapseAll,
    expandAll: treeStore.expandAll,
    store: () => treeStore,
  }
}
