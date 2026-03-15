// Types
import type { ITreeNodeProps } from '../types/tree-node-props.type'

// Functions
import { isNodeSelected } from '../functions/is-node-selected'

// Store
import { useTreeStore } from '../stores/tree.store'
import { getParentsFromPath } from '../functions/get-parents-from-path'

export function useTreeNode<T extends IItem = IItem>(payload: ITreeNodeProps<T>) {
  const { node, ui, index } = payload
  const store = useTreeStore()
  const {
    idKey,
    isSearched,
    searchConfig,
    nodeMetaById,
    selection,
    nodeFocused,
    nodeHovered,
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
    return !!(selectionConfig.value?.enabled && selectionConfig.value?.multi)
  })

  const isSelected = computed(() => {
    return isNodeSelected({
      node,
      selection: selection.value,
      idKey: idKey.value,
    })
  })

  const isFocused = computed(() => {
    return nodeFocused.value?.id === node.id
  })

  const isHovered = computed(() => {
    return nodeHovered.value?.id === node.id
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

  const usesFlatSearchView = computed(() => {
    return isSearched.value && !searchConfig.value?.keepParents
  })

  // Styles
  const treeNodeStyle = computed(() => {
    return {
      '--level': nodeMeta.value?.level,
      '--treePadding': usesFlatSearchView.value ? '0' : ui?.nodePadding,
    }
  })

  const treeNodeClass = computed(() => {
    const { isChildrenLoaded, level } = nodeMeta.value ?? {}
    const { ref } = payload.node
    const isCollapsible = !isChildrenLoaded || get(ref, childrenKey.value)?.length

    return [
      `level-${level}`,
      {
        'is-root': level === 0,
        'is-padded': level !== 0 && !isCollapsible,
        'is-collapsed': nodeMeta.value?.isCollapsed,
        'is-searched': isSearched.value,
        'is-selected': isSelected.value,
        'is-multi': selectionConfig.value?.multi,
        'is-selectable': selectionConfig.value?.enabled && !selectionConfig.value?.multi,
        'is-focused': isFocused.value,
        'is-hovered': isHovered.value,
        'is-open': !nodeMeta.value?.isCollapsed,
        'is-collapsible': isCollapsible,
        'uses-checkbox': hasMultiSelect.value,
      },
    ]
  })

  return {
    emits,
    isDndEnabled,
    isSearched,
    usesFlatSearchView,
    isCollapsed,
    isSelected,
    hasMultiSelect,
    nodeMeta,
    nodeHovered,
    treeNodeStyle,
    treeNodeClass,
    nodePath,
    getStore: () => store,
  }
}
