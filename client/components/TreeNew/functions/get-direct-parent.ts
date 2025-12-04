// Types
import type { ITreeNode } from '../types/tree-node.new.type'
import type { ITreeNodeMeta } from '../types/tree-node-meta.new.type'

// Functions
import { getParentsFromPath } from './get-parents-from-path'

export function getDirectParent<T extends IItem = IItem>(payload: {
  node: ITreeNode<T>
  nodeById: Record<string, ITreeNode<T>>
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
