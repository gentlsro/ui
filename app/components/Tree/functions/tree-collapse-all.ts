// Store
import type { useTreeStore } from '../stores/tree.store'

export function treeCollapseAll(payload: {
  getStore: () => ReturnType<typeof useTreeStore>
}) {
  const { getStore } = payload
  const { nodeMetaById, nodesFlattened, isSearchExpanded, searchCollapsedIds } = getStore()

  // While a search shows every match open, only the search's own state changes
  if (isSearchExpanded.value) {
    searchCollapsedIds.value = new Set(nodesFlattened.value.map(node => node.id))

    return
  }

  Object.values(nodeMetaById.value).forEach(nodeMeta => {
    nodeMeta.isCollapsed = true
  })
}
