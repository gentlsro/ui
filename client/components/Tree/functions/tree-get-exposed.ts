import { useTreeStore } from '$ui'

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
