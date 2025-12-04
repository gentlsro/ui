// Types
import type { ITreeNode } from '../types/tree-node.new.type'

// Functions
import { getChildren } from './get-children-from-path'

// Store
import type { useTreeStore } from '../stores/tree.store.new'
import { isNodeSelected } from './is-node-selected'

export async function selectNode(payload: {
  node: ITreeNode<IItem>
  ev?: MouseEvent | KeyboardEvent
  getStore: () => ReturnType<typeof useTreeStore>
}) {
  const { node, ev, getStore } = payload
  const {
    emits,
    selection,
    selectionConfig,
    nodesFlattened,
    childrenKey,
    nodeMetaById,
  } = getStore()

  if (!selectionConfig.value?.enabled) {
    return
  }

  if (selectionConfig.value?.beforeSelect) {
    const shouldContinue = await selectionConfig.value?.beforeSelect({ node })

    if (shouldContinue === false) {
      return
    }
  }

  const isEmitKey = !!selectionConfig.value?.emitKey
  const isMulti = selectionConfig.value?.multi
  const isSelected = isNodeSelected({ node, selection: selection.value, idKey: 'id' })

  const children = getChildren({
    node,
    nodesFlattened: nodesFlattened.value,
    childrenKey: childrenKey.value,
    nodeMetaById: nodeMetaById.value,
  })

  const model = Array.isArray(selection.value)
    ? selection.value
    : selection.value ? [selection.value] : []

  // When selected
  if (isSelected) {
    if (isMulti) {
      const ids = [
        ...children.map(c => typeof c === 'object' ? c.id : c),
        node.id,
      ]

      selection.value = model
        .filter(s => !ids.includes(typeof s === 'object' ? s.id : s))
    } else {
      selection.value = undefined
    }

    emits.value.nodeUnselect({ node, ev })
  }

  // When unselected
  else {
    if (isMulti) {
      selection.value = [
        ...model,
        isEmitKey ? node.id : node,
        ...(isEmitKey ? children.map(c => c.id) : children),
      ]
    } else {
      selection.value = isEmitKey ? node.id : node
    }

    emits.value.nodeSelect({ node, ev })
  }
}
