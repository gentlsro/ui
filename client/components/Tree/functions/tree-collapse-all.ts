// Types
import type { ITreeNodeMeta } from '../types/tree-node-meta.type'

export function treeCollapseAll(payload: {
  nodeMetaById: Record<string, ITreeNodeMeta>
}) {
  const { nodeMetaById } = payload

  Object.values(nodeMetaById).forEach(nodeMeta => {
    nodeMeta.isCollapsed = true
  })
}
