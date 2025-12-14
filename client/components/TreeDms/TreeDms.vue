<script setup lang="ts" generic="T extends IItem = IItem">
import type { NonUndefined } from 'utility-types'

// Types
import type { ITreeDmsProps } from './types/tree-dms-props.type'
import type { ITreeNode } from '#layers/ui/client/components/TreeNew/types/tree-node.new.type'
import type { ITreeProps } from '#layers/ui/client/components/TreeNew/types/tree-props.new.type'

// Functions
import { getDirectParent } from '#layers/ui/client/components/TreeNew/functions/get-direct-parent'

// Store
import { TREE_DMS_INJECTION_KEY, useTreeDmsStore } from './stores/tree-dms.store'

const props = defineProps<ITreeDmsProps<T>>()

// Init
const uuid = generateUUID()
provideLocal(TREE_DMS_INJECTION_KEY, uuid)

// Store
const {
  modifiers,
  nodeSelected,
  nodeContextMenu,
  isContextMenuOpen,
  folderKey,
} = useTreeDmsStore({ props })

// Layout
const model = defineModel<T[]>()
const search = ref('')
const treeEl = useTemplateRef('treeEl')

syncRef(toRef(props, 'modifiers'), modifiers, { direction: 'ltr' })

// Menu
function handleNodeClick(payload: { node: ITreeNode<T>, ev?: MouseEvent }) {
  const { node, ev } = payload
  const target = ev?.target as HTMLElement
  const isRightClick = ev?.button === 2
  const store = treeEl.value?.store()

  if (isRightClick && store) {
    const { nodeFocused } = store

    nodeFocused.value = node
  }

  if (!target || !isRightClick) {
    return false
  }

  ev?.preventDefault()
  ev?.stopPropagation()

  isContextMenuOpen.value = true
  nodeContextMenu.value = node
}

function handleContextMenuClick(ev: MouseEvent) {
  ev.preventDefault()
  ev.stopPropagation()

  nodeContextMenu.value = undefined
  isContextMenuOpen.value = true
}

// Move event handling
const handleItemMove: NonUndefined<ITreeProps<T>['dndConfig']>['onBeforeMove'] = payload => {
  const { node, targetParent } = payload

  if (!modifiers.value?.onItemMove) {
    return node.ref
  }

  return modifiers.value?.onItemMove?.({
    item: node.ref,
    parent: targetParent?.ref,
  })
}

// Resolving parent
const getParentNode: NonUndefined<ITreeProps<T>['dndConfig']>['getParentNode'] = payload => {
  const { targetNode } = payload

  if (!targetNode) {
    return null
  }

  if (targetNode?.ref.type === folderKey.value) {
    return targetNode
  }

  return getDirectParent({ ...payload, node: targetNode })
}
</script>

<template>
  <TreeNew
    ref="treeEl"
    v-bind="treeProps"
    v-model="model"
    v-model:search="search"
    v-model:selection="nodeSelected"
    :dnd-config="{
      getParentNode,
      onBeforeMove: handleItemMove,
      ...treeProps?.dndConfig,
    }"
    @click:node="handleNodeClick"
    @contextmenu="handleContextMenuClick"
  >
    <template #search="searchProps">
      <TreeDmsSearch
        v-model:search="search"
        v-bind="searchProps"
        :label
      />
    </template>

    <template #node="{ node }">
      <TreeDmsNodeFolder
        v-if="node.ref.type === folderKey"
        :node
      />

      <TreeDmsNodeFile
        v-else
        :node
      />
    </template>

    <template #inner>
      <TreeDmsContextMenu />
    </template>
  </TreeNew>
</template>
