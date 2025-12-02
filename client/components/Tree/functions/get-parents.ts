// Types
import type { ITreeNodeMeta } from '../types/tree-node-meta.type'

export function getParents(
  node: ITreeNode,
  nodeMetaById: Record<ITreeNode['id'], ITreeNodeMeta>,
  parentKey: string,
): ITreeNode[] {
  const parent = get(node, parentKey)

  if (!parent) {
    return []
  }

  return [parent, ...getParents(parent, nodeMetaById, parentKey)]
}
