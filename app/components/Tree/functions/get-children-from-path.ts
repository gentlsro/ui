// Types
import type { ITreeNode } from '../types/tree-node.type'
import type { ITreeNodeMeta } from '../types/tree-node-meta.type'

export function getChildren<T extends IItem = IItem>(payload: {
  node: ITreeNode<T>
  nodesFlattened: ITreeNode<T>[]
  childrenKey: string
  nodeMetaById: Record<string, ITreeNodeMeta>
}): ITreeNode<T>[] {
  const { node, nodesFlattened, childrenKey, nodeMetaById } = payload

  const nodePath = `${nodeMetaById[node.id]?.path}.${childrenKey}.`
  const children = nodesFlattened
    .filter(childNode => nodeMetaById[childNode.id]?.path?.startsWith(nodePath))

  return children
}
