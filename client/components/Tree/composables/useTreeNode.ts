// Types
import type { ITreeNodeProps } from '../types/tree-node-props.type'

// Functions
import { isNodeSelected } from '../functions/is-node-selected'

// Store
import { useTreeStore } from '../stores/tree.store.new'

export function useTreeNode<T extends IItem = IItem>(payload: ITreeNodeProps<T>) {
  const { node, ui, index } = payload
  const {
    isSearched,
    nodeMetaById,
    selection,
    selectionConfig,
  } = useTreeStore()

  const nodeMeta = computed(() => {
    return nodeMetaById.value[node.id]
  })

  const isSelected = computed(() => {
    return isNodeSelected({
      node,
      selection: selection.value,
      idKey: 'id',
    })
  })

  const isCollapsed = computed(() => {
    return nodeMeta.value?.isCollapsed
  })

  // Node
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
      // 'is-focused': nodeFocused.value?.id === node.value.id,
      'is-open': !nodeMeta.value?.isCollapsed,
    }
  })

  const nodeClass = computed(() => {
    return typeof ui?.nodeClass === 'function'
      ? ui?.nodeClass({ node: node.value, isSelected: isSelected.value, index })
      : ui?.nodeClass
  })

  const nodeStyle = computed(() => {
    return typeof ui?.nodeStyle === 'function'
      ? ui?.nodeStyle({ node: node.value, isSelected: isSelected.value, index })
      : ui?.nodeStyle
  })

  // Node content
  const nodeContentClass = computed(() => {
    return typeof ui?.nodeContentClass === 'function'
      ? ui?.nodeContentClass({ node: node.value, isSelected: isSelected.value, index })
      : ui?.nodeContentClass
  })

  const nodeContentStyle = computed(() => {
    return typeof ui?.nodeContentStyle === 'function'
      ? ui?.nodeContentStyle({ node: node.value, isSelected: isSelected.value, index })
      : ui?.nodeContentStyle
  })

  return {
    isSearched,
    isCollapsed,
    isSelected,
    treeNodeStyle,
    treeNodeClass,
    nodeClass,
    nodeStyle,
    nodeContentClass,
    nodeContentStyle,
  }
}
