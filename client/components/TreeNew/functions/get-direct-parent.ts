// Types
import type { ITreeNode } from '../types/tree-node.new.type'
import type { ITreeNodeMeta } from '../types/tree-node-meta.new.type'

// Functions
import { getParentsFromPath } from './get-parents-from-path'

export function getDirectParent(payload: {
  node: ITreeNode<IItem>
  nodeById: Record<string, ITreeNode<IItem>>
  nodeMetaById: Record<string, ITreeNodeMeta>
  childrenKey: string
}) {
  const { node, nodeById, nodeMetaById, childrenKey } = payload

  const parent = getParentsFromPath({
    path: nodeMetaById[node.id]?.path ?? '',
    nodeById,
    childrenKey,
  }).at(-1)

  return parent
}
