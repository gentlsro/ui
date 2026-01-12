// Store
import { selectNode } from '../functions/select-node'
import { useTreeStore } from '../stores/tree.store'
import { toggleNodeCollapse } from '../functions/toggle-node-collapse'

export function useTreeKeyboard() {
  // Store
  const uiStore = useUIStore()
  const { activeElement } = storeToRefs(uiStore)
  const store = useTreeStore()
  const {
    treeEl,
    scrollerEl,
    nodesVisible,
    nodeMetaById,
    nodeFocused,
  } = store

  const { focused } = useFocusWithin(treeEl)

  onKeyStroke(
    ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Enter', 'Tab'],
    handleKey,
  )

  whenever(
    () => !focused.value,
    () => nodeFocused.value = undefined,
  )

  function handleKey(ev: KeyboardEvent) {
    const _isActiveElementInput = uiStore.isActiveElementInput()
    const isActiveElementTreeSearch = _isActiveElementInput && activeElement.value?.closest('.tree-search')

    if (!nodesVisible.value || !focused.value || (_isActiveElementInput && !isActiveElementTreeSearch)) {
      return
    }

    const nodeMeta = nodeMetaById.value[nodeFocused.value?.id ?? '__empty__']
    const focusedNodeIdx = nodesVisible.value.findIndex(n => n.id === nodeFocused.value?.id) ?? -1

    switch (ev.key) {
      // Just prevent Tab
      case 'Tab':
        ev.preventDefault()
        break

      // Move to the previous node
      case 'ArrowUp':
        ev.preventDefault()

        if (focusedNodeIdx > 0) {
          nodeFocused.value = nodesVisible.value?.[focusedNodeIdx - 1]
        } else {
          nodeFocused.value = nodesVisible.value?.[nodesVisible.value?.length - 1]
        }

        break

      // Move to the next node
      case 'ArrowDown':
        ev.preventDefault()

        if (focusedNodeIdx < nodesVisible.value?.length - 1) {
          nodeFocused.value = nodesVisible.value?.[focusedNodeIdx + 1]
        } else {
          nodeFocused.value = nodesVisible.value?.[0]
        }

        break

      // Collapse
      case 'ArrowLeft':
        ev.preventDefault()

        if (nodeMeta && !nodeMeta?.isCollapsed && nodeFocused.value) {
          toggleNodeCollapse({ node: nodeFocused.value, getStore: () => store })
        }

        break

      // Expand
      case 'ArrowRight':
        ev.preventDefault()

        if (nodeMeta && nodeMeta?.isCollapsed && nodeFocused.value) {
          toggleNodeCollapse({ node: nodeFocused.value, getStore: () => store })
        }

        break

      // Select
      case 'Enter':
        ev.preventDefault()

        if (nodeFocused.value) {
          selectNode({ node: nodeFocused.value, ev, getStore: () => store })
        }

        break
    }

    if (scrollerEl.value && nodeFocused.value) {
      scrollerEl.value.scrollTo?.(focusedNodeIdx)
    }
  }
}
