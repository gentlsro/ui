// Types
import type { ITreeNode } from '../../Tree/types/tree-node.type'

// Functions
import { getDirectParent } from '../../Tree/functions/get-direct-parent'
import { isNodeSelected } from '../../Tree/functions/is-node-selected'
import { selectNode } from '../../Tree/functions/select-node'

// Store
import type { useTreeDmsStore } from '../stores/tree-dms.store'
import type { useTreeStore } from '../../Tree/stores/tree.store'

export async function handleItemBlur<T extends IItem>(payload: {
  inputEl?: HTMLElement | null
  node: Ref<ITreeNode<T>>
  select: () => void
  getTreeStore: () => ReturnType<typeof useTreeStore>
  getTreeDmsStore: () => ReturnType<typeof useTreeDmsStore>
}) {
  const { inputEl, node, select, getTreeStore, getTreeDmsStore } = payload
  const { isLoadingByNodeId, modifiers, nodeEditing, isCurrentlyAddingItem } = getTreeDmsStore()

  const treeStore = getTreeStore()
  const {
    selection,
    removeNode,
    insertNode,
    nodeById,
    nodeMetaById,
    labelKey,
    childrenKey,
    selectionConfig,
  } = treeStore

  if (!inputEl || isLoadingByNodeId.value[node.value.id] || nodeEditing.value?.id !== node.value.id) {
    isCurrentlyAddingItem.value = false

    return
  }

  const { onItemCreate, onItemRename } = modifiers.value ?? {}
  const isNew = node.value.ref.__isNew
  const onAfter = isNew ? onItemCreate : onItemRename

  // If we don't use any modifiers, we can just update the node label
  if (!onAfter) {
    delete node.value.ref.__isNew

    // @ts-expect-error Bad type but fuck off
    node.value.ref[labelKey.value] = inputEl?.textContent ?? ''
    nodeEditing.value = undefined
    isCurrentlyAddingItem.value = false

    return
  }

  let shouldProceed = true
  let item = {
    ...node.value.ref,
    [labelKey.value]: inputEl.textContent ?? '',
  } as IItem

  // After create
  if (onAfter) {
    isLoadingByNodeId.value[node.value.id] = true

    try {
      item = await onAfter({
        item,
        parent: getDirectParent({
          node: node.value,
          nodeById: nodeById.value,
          nodeMetaById: nodeMetaById.value,
          childrenKey: childrenKey.value,
        })?.ref,
      })
    }

    catch {
      shouldProceed = false
    }
    
    finally {
      isLoadingByNodeId.value[node.value.id] = false
    }
  }

  if (!shouldProceed) {
    select()

    return
  }

  if ('__isNew' in item) {
    delete item.__isNew
  }
  isCurrentlyAddingItem.value = false

  const parent = getDirectParent({
    node: node.value,
    nodeById: nodeById.value,
    nodeMetaById: nodeMetaById.value,
    childrenKey: childrenKey.value,
  })

  // We need to replace the current node with the one we got from the modifier
  const newNodes = removeNode(node.value, { commit: false })
  const addedNode = await insertNode(item, { parent, nodes: newNodes })

  // Update the selection
  const isSelected = isNodeSelected({
    node: addedNode,
    selection: selection.value,
    idKey: 'id',
    selectionConfig: selectionConfig.value,
  })

  if (isSelected) {
    selectNode({ node: addedNode, getStore: () => treeStore })

    // We need to wait for the deselect first to select the new object
    nextTick(() => {
      selectNode({ node: addedNode, getStore: () => treeStore })
    })
  }

  nodeEditing.value = undefined
}
