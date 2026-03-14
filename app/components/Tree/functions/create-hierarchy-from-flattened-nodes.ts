import { set } from 'lodash-es'

// Types
import type { ITreeNode } from '../types/tree-node.type'
import type { ITreeNodeMeta } from '../types/tree-node-meta.type'

function recursivelyBuildHierarchy<T extends IItem = IItem>(payload: {
  node: ITreeNode<T>
  nodesFlattened: ITreeNode<T>[]
  childrenKey: string
  nodeMetaById: Record<ITreeNode['id'], ITreeNodeMeta>
}): void {
  const { node, nodesFlattened, childrenKey, nodeMetaById } = payload

  const nodePath = nodeMetaById[node.id]?.path
  if (!nodePath) {
    return
  }

  // Find direct children: nodes whose path starts with `${nodePath}.${childrenKey}.`
  // and doesn't have another `.${childrenKey}.` after that (meaning they're direct, not nested deeper)
  const childrenPathPrefix = `${nodePath}.${childrenKey}.`
  const children = nodesFlattened.filter(childNode => {
    const childPath = nodeMetaById[childNode.id]?.path

    if (!childPath?.startsWith(childrenPathPrefix)) {
      return false
    }
    // Check if it's a direct child (no nested childrenKey in the remaining path)
    const remainingPath = childPath.slice(childrenPathPrefix.length)
    return !remainingPath.includes(`.${childrenKey}.`)
  })

  // Always override children based ONLY on nodesFlattened
  const childrenRefs = children.map(child => child.ref)
  set(node.ref, childrenKey, childrenRefs)

  // Recursively build hierarchy for each child
  children.forEach(child => {
    recursivelyBuildHierarchy({
      node: child,
      nodesFlattened,
      childrenKey,
      nodeMetaById,
    })
  })
}

export function createHierarchyFromFlattenedNodes<T extends IItem = IItem>(payload: {
  nodesFlattened: ITreeNode<T>[]
  childrenKey: string
  nodeMetaById: Record<ITreeNode['id'], ITreeNodeMeta>
}) {
  const { nodesFlattened, childrenKey, nodeMetaById } = payload

  if (nodesFlattened.length === 0) {
    return []
  }

  // Find root nodes: nodes whose path doesn't contain `.${childrenKey}.`
  const rootNodes = nodesFlattened.filter(node => {
    const path = nodeMetaById[node.id]?.path
    return path && !path.includes(`.${childrenKey}.`)
  })

  // Recursively build hierarchy for each root node
  rootNodes.forEach(rootNode => {
    recursivelyBuildHierarchy({
      node: rootNode,
      nodesFlattened,
      childrenKey,
      nodeMetaById,
    })
  })

  // Return the refs of root nodes (the actual T objects with hierarchy)
  return rootNodes.map(node => node.ref) as T[]
}
