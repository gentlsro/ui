// Types
import type { ITreeNode } from '../types/tree-node.new.type'
import type { ITreeNodeMeta } from '../types/tree-node-meta.new.type'

export function getChildren(payload: {
  node: ITreeNode
  nodesFlattened: ITreeNode[]
  childrenKey: string
  nodeMetaById: Record<string, ITreeNodeMeta>
}) {
  const { node, nodesFlattened, childrenKey, nodeMetaById } = payload

  const nodePath = `${nodeMetaById[node.id]?.path}.${childrenKey}.`
  const children = nodesFlattened
    .filter(childNode => nodeMetaById[childNode.id]?.path?.startsWith(nodePath))

  return children as ITreeNode[]
}
