<script setup lang="ts" generic="T extends IItem = IItem">
// Types
import type { ITreeDmsProps } from './types/tree-dms-props.type'
import type { ITreeNode } from '../Tree/types/tree-node.type'
import type { ITreeNodeMeta } from '../Tree/types/tree-node-meta.type'

// Functions
import { handleItemDrop } from './functions/handle-item-drop'
import { getDirectParent } from '../Tree/functions/get-direct-parent'

// Store
import { useTreeStore } from '../Tree/stores/tree.store'

type IProps = Pick<ITreeDmsProps<T>, 'modelValue' | 'fileKey' | 'folderKey' | 'treeProps' | 'dropZoneConfig'>

const props = defineProps<IProps>()

// Store
const {
  treeEl,
  nodeById,
  nodeMetaById,
  dragMeta,
  dndConfig,
  expandNode,
} = useTreeStore<T>()

// Utils
const { fnc = handleItemDrop } = props.dropZoneConfig ?? {}

const childrenKeyVal = props.treeProps?.childrenKey ?? 'children'

function handleStructureItemCreated(payload: {
  item: T
  parentItem?: T | null
}) {
  const { item, parentItem } = payload

  const parent = parentItem?.type === props.folderKey ? parentItem : undefined

  if (parent) {
    // @ts-expect-error
    parent[childrenKeyVal] = [...(parent[childrenKeyVal] ?? []), item]

    model.value = [...model.value ?? []]
  } else {
    model.value = [...(model.value ?? []), item]
  }
}

// Layout
const model = defineModel<T[]>()

// ---- External drop → same dragMeta state as internal DnD ----

function resolveNodeAtPoint(x: number, y: number) {
  const elements = document.elementsFromPoint(x, y)

  // Find the .content-row that VirtualScroller renders
  const contentRow = elements.find(el => el.classList.contains('content-row')) as HTMLElement | undefined

  if (!contentRow) {
    return null
  }

  // The tree node is the first child of .content-row
  const treeNodeEl = contentRow.children[0] as HTMLElement | undefined

  if (!treeNodeEl) {
    return null
  }

  const rawId = treeNodeEl.getAttribute('data-id')

  if (!rawId) {
    return null
  }

  const nodeIdNum = Number(rawId)
  const node = (nodeById.value?.[rawId] ?? nodeById.value?.[nodeIdNum]) as ITreeNode<T> | undefined

  if (!node) {
    return null
  }

  return { node, contentRow, treeNodeEl }
}

function clearExternalDragMeta() {
  dragMeta.value = {}
  clearHoverExpandTimer()
}

// Hover-to-expand collapsed folders (same as internal DnD)
let hoverExpandTimer: ReturnType<typeof setTimeout> | null = null
let hoverExpandTargetId: string | number | null = null

function startHoverExpandTimer(node: ITreeNode<T>) {
  if (hoverExpandTargetId === node.id) {
    return
  }

  clearHoverExpandTimer()

  hoverExpandTargetId = node.id
  hoverExpandTimer = setTimeout(() => {
    expandNode(node)
  }, 800)
}

function clearHoverExpandTimer() {
  if (hoverExpandTimer) {
    clearTimeout(hoverExpandTimer)
    hoverExpandTimer = null
  }

  hoverExpandTargetId = null
}

function resolveParentNode(targetNode: ITreeNode<T>): ITreeNode<T> | undefined | null {
  if (dndConfig.value?.getParentNode) {
    return dndConfig.value.getParentNode({
      childrenKey: childrenKeyVal,
      dragMeta: dragMeta.value as ITreeDragMeta<T>,
      draggedNode: undefined as unknown as ITreeNode<T>,
      targetNode,
      nodeById: nodeById.value,
      nodeMetaById: nodeMetaById.value,
    })
  }

  if (targetNode.ref.type === props.folderKey) {
    return targetNode
  }

  // File node — resolve parent folder
  const parent = getDirectParent({
    node: targetNode,
    nodeById: nodeById.value,
    nodeMetaById: nodeMetaById.value,
    childrenKey: childrenKeyVal,
  })

  return parent?.ref.type === props.folderKey ? parent : null
}

function handleExternalDragOver(e: DragEvent) {
  e.preventDefault()

  if (!dndConfig.value?.enabled) {
    return
  }

  const resolved = resolveNodeAtPoint(e.clientX, e.clientY)

  if (!resolved) {
    dragMeta.value = { dropAllowed: true }

    return
  }

  const { node, contentRow } = resolved

  // Check if drop is allowed (pass undefined for draggedNode since this is external)
  const isDropAllowed = dndConfig.value?.canBeDropped?.({
    draggedNode: undefined as unknown as ITreeNode<T>,
    targetNode: node,
    nodeById: nodeById.value,
    nodeMetaById: nodeMetaById.value,
  }) ?? true

  if (!isDropAllowed) {
    dragMeta.value = { dropAllowed: false }

    return
  }

  const targetNodeMeta: ITreeNodeMeta | undefined = nodeMetaById.value[node.id]

  // Resolve parent folder — same logic for both place and parent modes
  const parentNode = resolveParentNode(node)

  // Hover-to-expand collapsed folders
  const nodeToExpand = parentNode ?? (node.ref.type === props.folderKey ? node : null)

  if (nodeToExpand && nodeMetaById.value[nodeToExpand.id]?.isCollapsed) {
    startHoverExpandTimer(nodeToExpand)
  } else {
    clearHoverExpandTimer()
  }

  // Placement mode (above/below indicator)
  if (dndConfig.value?.dropMode === 'place') {
    const rect = contentRow.getBoundingClientRect()
    const computedStyle = getComputedStyle(contentRow)
    const rowHeight = +computedStyle.getPropertyValue('--rowHeight')
    const translateY = +computedStyle.getPropertyValue('--translateY')
    const isAbove = e.clientY <= (rect.top + rect.height / 2)

    dragMeta.value = {
      target: node,
      targetEl: contentRow,
      targetParent: parentNode ?? { id: '__ROOT__' },
      placement: isAbove ? 'above' : 'below',
      dropAllowed: true,
      dropIndicatorCSS: {
        '--translateY': isAbove ? translateY : `${translateY + rowHeight}`,
        '--left': `${((targetNodeMeta?.level ?? 0) + 1) * 12}px`,
      },
    }

    return
  }

  // Parent mode (default) — highlight the parent
  dragMeta.value = {
    targetParent: parentNode ?? { id: '__ROOT__' },
    dropAllowed: true,
  }
}

function handleExternalDragLeave(e: DragEvent) {
  const treeElDom = unrefElement(treeEl) as HTMLElement | undefined

  if (!treeElDom || !e.relatedTarget || !treeElDom.contains(e.relatedTarget as Node)) {
    clearExternalDragMeta()
  }
}

function handleExternalDrop() {
  clearExternalDragMeta()
}

function bindExternalDropHandlers() {
  const el = unrefElement(treeEl) as HTMLElement | undefined

  if (!el) {
    return
  }

  el.addEventListener('dragover', handleExternalDragOver)
  el.addEventListener('dragleave', handleExternalDragLeave)
  el.addEventListener('drop', handleExternalDrop)
}

function unbindExternalDropHandlers() {
  const el = unrefElement(treeEl) as HTMLElement | undefined

  if (!el) {
    return
  }

  el.removeEventListener('dragover', handleExternalDragOver)
  el.removeEventListener('dragleave', handleExternalDragLeave)
  el.removeEventListener('drop', handleExternalDrop)
}

onMounted(() => {
  nextTick(bindExternalDropHandlers)
})

onBeforeUnmount(() => {
  unbindExternalDropHandlers()
})

const { isOverDropZone: _isOverDropZone } = useDropZone(
  () => unrefElement(treeEl) as HTMLElement,
  {
    multiple: true,
    onDrop: async (_, e) => {
      // Resolve parent from dragMeta (same as internal DnD)
      const targetParent = dragMeta.value.targetParent
      const treeParent: T | null | undefined = targetParent && 'ref' in targetParent
        ? targetParent.ref as T
        : null

      const items = (e.dataTransfer?.items ?? []) as DataTransferItemList

      const createdParentByName: Record<string, T> = {}

      processDroppedItems(items, async (item, parentItem, file) => {
        const isFile = 'type' in item

        // Resolve parent: use treeParent for top-level drops;
        // nested files/dirs inside dropped directories use createdParentByName
        const resolvedParent = createdParentByName[parentItem?.name ?? '']
          ?? (parentItem ? undefined : treeParent)

        // File
        if (isFile) {
          if (!file) {
            return
          }

          const res = await fnc({
            item,
            file,
            parent: resolvedParent,
            fileKey: props.fileKey,
            folderKey: props.folderKey,
          }) as T

          handleStructureItemCreated({ item: res, parentItem: resolvedParent })
        }

        // Directory
        else {
          const res = await fnc({
            item,
            parent: resolvedParent,
            fileKey: props.fileKey,
            folderKey: props.folderKey,
          }) as T

          createdParentByName[item.name] = res
          handleStructureItemCreated({ item: res, parentItem: resolvedParent })
        }
      })
    },
  },
)
</script>

<template>
  <div />
</template>
