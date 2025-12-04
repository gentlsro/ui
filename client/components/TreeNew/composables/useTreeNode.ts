// Types
import type { ITreeNodeProps } from '../types/tree-node-props.type'

// Functions
import { isNodeSelected } from '../functions/is-node-selected'

// Store
import { useTreeStore } from '../stores/tree.store.new'
import { getParentsFromPath } from '../functions/get-parents-from-path'

export function useTreeNode<T extends IItem = IItem>(payload: ITreeNodeProps<T>) {
  const { node, ui, index } = payload
  const store = useTreeStore()
  const {
    isSearched,
    nodeMetaById,
    selection,
    nodeFocused,
    selectionConfig,
    childrenKey,
    nodeById,
    dndConfig,
    emits,
  } = store

  const nodeMeta = computed(() => {
    return nodeMetaById.value[node.id]
  })

  const isDndEnabled = computed(() => {
    return dndConfig.value?.enabled
  })

  const hasMultiSelect = computed(() => {
    return selectionConfig.value?.enabled && selectionConfig.value?.multi
  })

  const isSelected = computed(() => {
    return isNodeSelected({
      node,
      selection: selection.value,
      idKey: 'id',
    })
  })

  const isFocused = computed(() => {
    return nodeFocused.value?.id === node.id
  })

  const isCollapsed = computed(() => {
    return nodeMeta.value?.isCollapsed
  })

  const nodePath = computed(() => {
    if (!nodeMeta.value?.path) {
      return ''
    }

    const parents = getParentsFromPath({
      path: nodeMeta.value.path,
      nodeById: nodeById.value,
      childrenKey: childrenKey.value,
    })

    return parents.map(p => p.label).join(' > ')
  })

  // Styles
  const treeNodeStyle = computed(() => {
    return {
      '--level': nodeMeta.value?.level,
      '--treePadding': isSearched.value ? '0' : ui?.nodePadding,
    }
  })

  const treeNodeClass = computed(() => {
    return {
      'is-collapsed': nodeMeta.value?.isCollapsed,
      'is-searched': isSearched.value,
      'is-selected': isSelected.value,
      'is-multi': selectionConfig.value?.multi,
      'is-selectable': selectionConfig.value?.enabled && !selectionConfig.value?.multi,
      'is-focused': isFocused.value,
      'is-open': !nodeMeta.value?.isCollapsed,
    }
  })

  const nodeClass = computed(() => {
    return typeof ui?.nodeClass === 'function'
      ? ui?.nodeClass({
          node: node.ref,
          isSelected: isSelected.value,
          index,
          isFocused: isFocused.value,
        })
      : ui?.nodeClass
  })

  const nodeStyle = computed(() => {
    return typeof ui?.nodeStyle === 'function'
      ? ui?.nodeStyle({
          node: node.ref,
          isSelected: isSelected.value,
          index,
          isFocused: isFocused.value,
        })
      : ui?.nodeStyle
  })

  // Node content
  const nodeContentClass = computed(() => {
    return typeof ui?.nodeContentClass === 'function'
      ? ui?.nodeContentClass({
          node: node.ref,
          isSelected: isSelected.value,
          index,
          isFocused: isFocused.value,
        })
      : ui?.nodeContentClass
  })

  const nodeContentStyle = computed(() => {
    return typeof ui?.nodeContentStyle === 'function'
      ? ui?.nodeContentStyle({
          node: node.ref,
          isSelected: isSelected.value,
          index,
          isFocused: isFocused.value,
        })
      : ui?.nodeContentStyle
  })

  return {
    emits,
    isDndEnabled,
    isSearched,
    isCollapsed,
    isSelected,
    hasMultiSelect,
    nodeMeta,
    treeNodeStyle,
    treeNodeClass,
    nodeClass,
    nodeStyle,
    nodePath,
    nodeContentClass,
    nodeContentStyle,
    getStore: () => store,
  }
}
