// Types
import type { ITreeNode } from '../types/tree-node.new.type'

export function getParentsFromPath<T extends IItem = IItem>(payload: {
  path: string
  nodeById: Record<string, ITreeNode<T>>
  childrenKey: string
}): ITreeNode<T>[] {
  const { path, nodeById, childrenKey } = payload

  const parents = path.split('.')
    .filter(path => path !== childrenKey)
    .slice(0, -1)
    .map(id => nodeById[id])
    .filter(Boolean) as ITreeNode<T>[]

  return parents
}
