import { set } from 'lodash-es'

// Types
import type { ITreeNode } from '../types/tree-node.type'
import type { ITreeNodeMeta } from '../types/tree-node-meta.type'

export function createHierarchyFromFlattenedNodes<T extends IItem = IItem>(payload: {
  nodesFlattened: ITreeNode<T>[]
  childrenKey: string
  nodeMetaById: Record<ITreeNode['id'], ITreeNodeMeta>
}) {
  const { nodesFlattened, childrenKey, nodeMetaById } = payload

  const rootNodes: ITreeNode<T>[] = []
  const childrenByPath = new Map<string, ITreeNode<T>[]>()
  const separator = `.${childrenKey}.`

  // Index direct children once instead of scanning all nodes for every parent.
  // Appending in flattened order preserves both root and sibling ordering.
  for (const node of nodesFlattened) {
    const path = nodeMetaById[node.id]?.path
    if (!path) {
      continue
    }

    const parentEnd = path.lastIndexOf(separator)
    if (parentEnd === -1) {
      rootNodes.push(node)
      continue
    }

    const parentPath = path.slice(0, parentEnd)
    const siblings = childrenByPath.get(parentPath)
    if (siblings) {
      siblings.push(node)
    } else {
      childrenByPath.set(parentPath, [node])
    }
  }

  function buildChildren(node: ITreeNode<T>) {
    const path = nodeMetaById[node.id]!.path
    const children = childrenByPath.get(path) ?? []
    set(node.ref, childrenKey, children.map(child => child.ref))
    children.forEach(buildChildren)
  }

  rootNodes.forEach(buildChildren)

  return rootNodes.map(node => node.ref)
}
