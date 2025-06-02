// Store
import { useTreeStore } from '../stores/tree.store'

export function useTreeKeyboard() {
  // Store
  const treeStore = useTreeStore()
  const {
    nodesVisible,
    nodeMetaById,
    nodeFocused,
  } = storeToRefs(treeStore)

  // Layout
  const treeEl = ref<HTMLDivElement>()

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
    if (!nodesVisible.value || !focused.value) {
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

        if (nodeMeta && !nodeMeta?.collapsed && nodeFocused.value) {
          treeStore.toggleCollapse(nodeFocused.value)
        }

        break

      // Expand
      case 'ArrowRight':
        ev.preventDefault()

        if (nodeMeta && nodeMeta?.collapsed && nodeFocused.value) {
          treeStore.toggleCollapse(nodeFocused.value)
        }

        break

      // Select
      case 'Enter':
        ev.preventDefault()

        if (nodeFocused.value) {
          treeStore.handleSelect({ node: nodeFocused.value })
        }

        break
    }
  }

  return {
    treeEl,
  }
}
