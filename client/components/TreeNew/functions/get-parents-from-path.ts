// Types
import type { ITreeNode } from '../types/tree-node.new.type'

export function getParentsFromPath(payload: {
  path: string
  nodeById: Record<string, ITreeNode>
  childrenKey: string
}) {
  const { path, nodeById, childrenKey } = payload

  const parents = path.split('.')
    .filter(path => path !== childrenKey)
    .slice(0, -1)
    .map(id => nodeById[id])
    .filter(Boolean)

  return parents as ITreeNode[]
}
