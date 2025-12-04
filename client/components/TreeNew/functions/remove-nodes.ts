// Types
import type { ITreeNode } from '../types/tree-node.new.type'
import type { ITreeNodeMeta } from '../types/tree-node-meta.new.type'

// Functions
import { getChildren } from './get-children-from-path'
import { createHierarchyFromFlattenedNodes } from './create-hierarchy-from-flattened-nodes'

export function removeNodes<T extends IItem = IItem>(payload: {
  // Keys
  childrenKey: string

  // Data
  model: Ref<T[]>
  nodesToRemove: ITreeNode<T>[]
  nodesFlattened: Ref<ITreeNode<T>[]>
  nodeMetaById: Record<ITreeNode['id'], ITreeNodeMeta>

  // Options
  /**
   * When true, the items hierarchy will be created based on
   * the result and used to update the model. This will trigger
   * the necessary re-renders
   */
  commit?: boolean
}) {
  const {
    nodesToRemove,
    nodesFlattened,
    nodeMetaById,
    childrenKey,
    commit,
    model,
  } = payload

  const nodesToRemoveWithChildrenIds = nodesToRemove
    .flatMap(node => [
      node,
      ...getChildren<T>({
        node,
        childrenKey,
        nodesFlattened: nodesFlattened.value,
        nodeMetaById,
      }),
    ])
    .map(node => node.id)

  // We remove it from the flattened nodes
  const newNodes = nodesFlattened.value
    .filter(node => !nodesToRemoveWithChildrenIds.includes(node.id))

  if (commit) {
    model.value = createHierarchyFromFlattenedNodes({
      nodesFlattened: newNodes,
      childrenKey,
      nodeMetaById,
    })
  }

  return newNodes
}
