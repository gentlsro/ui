// Store
import type { useTreeStore } from '../stores/tree.store.new'

export function treeCollapseAll(payload: {
  getStore: () => ReturnType<typeof useTreeStore>
}) {
  const { getStore } = payload
  const { nodeMetaById } = getStore()

  Object.values(nodeMetaById.value).forEach(nodeMeta => {
    nodeMeta.isCollapsed = true
  })
}
