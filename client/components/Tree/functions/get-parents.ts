// Types
import type { ITreeNode } from '$utils/shared/types/tree-node.type'
import type { ITreeNodeMeta } from '../types/tree-node-meta.type'

export function getParents(node: ITreeNode, nodeMetaById: Record<ITreeNode['id'], ITreeNodeMeta>): ITreeNode[] {
  const parent = nodeMetaById[node.id]?.parent

  if (!parent) {
    return []
  }

  return [parent, ...getParents(parent, nodeMetaById)]
}
