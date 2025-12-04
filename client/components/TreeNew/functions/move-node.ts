// Types
import type { ITreeNode } from '../types/tree-node.new.type'
import type { ITreeDragMeta } from '../../Tree/types/tree-drag-meta.type'

// Functions
import { removeNodes } from './remove-nodes'
import { insertNodes } from './insert-nodes'

// Store
import type { useTreeStore } from '../stores/tree.store.new'
import { createHierarchyFromFlattenedNodes } from './create-hierarchy-from-flattened-nodes'
import { getParentsFromPath } from './get-parents-from-path'

export async function moveNode(payload: {
  nodeToMove: ITreeNode<IItem>
  dragMeta: Pick<ITreeDragMeta<IItem>, 'target' | 'targetParent' | 'placement'>
  mode: 'parent' | 'place'
  getStore: () => ReturnType<typeof useTreeStore>
}) {
  let { nodeToMove, getStore, dragMeta, mode } = payload
  let { target, targetParent, placement } = dragMeta

  const store = getStore()
  const {
    model,
    nodesFlattened,
    nodeById,
    nodeMetaById,
    dndConfig,
    childrenKey,
    idKey,
    labelKey,
    collapseConfig,
    sortingConfig,
  } = store

  // When moving above a parent node, we need to recalculate the parent target
  if (target && mode === 'place' && target === targetParent && placement === 'above') {
    const parentTargetParent = getParentsFromPath({
      childrenKey: childrenKey.value,
      nodeById: nodeById.value,
      path: nodeMetaById.value[target?.id]?.path ?? '',
    }).at(-1)

    if (parentTargetParent) {
      targetParent = parentTargetParent
    } else {
      targetParent = { id: '__ROOT__' }
    }
  }

  if (dndConfig.value?.onBeforeMoved) {
    const result = await dndConfig.value?.onBeforeMoved?.({
      node: nodeToMove,
      target,
      targetParent: targetParent?.id === '__ROOT__' ? null : targetParent as ITreeNode<IItem>,
      nodeById: nodeById.value,
      nodeMetaById: nodeMetaById.value,
    })

    if (result === false) {
      return
    }

    nodeToMove = result
  }

  let newNodes = removeNodes({
    model,
    nodesToRemove: [nodeToMove],
    childrenKey: childrenKey.value,
    nodesFlattened,
    nodeMetaById: nodeMetaById.value,
  })

  // Adjusting index for `place` mode
  let index = target?.id
    ? newNodes.findIndex(node => node.id === target.id)
    : -1

  if (mode === 'place') {
    index = placement === 'above' ? index - 1 : index

    if (placement === 'below' && index === -1) {
      index = -2
    }
  }

  const { nodes } = await insertNodes({
    model,
    items: [nodeToMove.ref],
    nodesFlattened: ref(newNodes),
    idKey: idKey.value,
    childrenKey: childrenKey.value,
    labelKey: labelKey.value,
    collapseConfig: collapseConfig.value,
    sortingConfig: sortingConfig.value,
    nodeMetaById,
    index,
    parent: targetParent?.id === '__ROOT__' ? null : targetParent as ITreeNode<IItem>,
  })

  newNodes = nodes

  model.value = createHierarchyFromFlattenedNodes({
    nodesFlattened: newNodes,
    childrenKey: childrenKey.value,
    nodeMetaById: nodeMetaById.value,
  })

  await dndConfig.value?.onMoved?.({
    node: nodeToMove,
    target,
    targetParent: targetParent?.id === '__ROOT__' ? null : targetParent as ITreeNode<IItem>,
    nodeById: nodeById.value,
    nodeMetaById: nodeMetaById.value,
  })
}
