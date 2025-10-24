// Store
import { useTreeStore } from '../stores/tree.store'

export function treeGetExposed() {
  const treeStore = useTreeStore()
  const { nodes } = storeToRefs(treeStore)

  return {
    nodes,
    collapseAll: treeStore.collapseAll,
    expandAll: treeStore.expandAll,
    store: () => treeStore,
  }
}
