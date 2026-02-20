<script setup lang="ts" generic="T extends IItem = IItem">
import type { NonUndefined } from 'utility-types'

// Types
import type { ITreeDmsProps } from './types/tree-dms-props.type'
import type { ITreeNode } from '../Tree/types/tree-node.type'
import type { ITreeProps } from '../Tree/types/tree-props.type'

// Functions
import { getDirectParent } from '../Tree/functions/get-direct-parent'
import { getComponentMergedProps, getComponentProps } from '../../utils/get-component-props'

// Store
import { TREE_DMS_INJECTION_KEY, useTreeDmsStore } from './stores/tree-dms.store'

const props = withDefaults(
  defineProps<ITreeDmsProps<T>>(),
  { ...getComponentProps('treeDms') },
)

defineExpose({
  getStore: () => useTreeDmsStore(),
  getTreeStore: () => {
    const treeStore = treeEl.value?.store()

    if (!treeStore) {
      throw new Error('Tree store not found')
    }

    return treeStore
  },
})

const mergedProps = computed(() => {
  return getComponentMergedProps('treeDms', props)
})

// Init
const uuid = generateUUID()
provideLocal(TREE_DMS_INJECTION_KEY, uuid)

// Store
const {
  modifiers,
  contextMenuConfig,
  nodeSelected,
  nodeContextMenu,
  isContextMenuOpen,
  folderKey,
} = useTreeDmsStore({ props })

// Layout
const model = defineModel<T[]>()
const search = ref('')
const treeEl = useTemplateRef('treeEl')

syncRef(computed(() => mergedProps.value?.modifiers), modifiers, { direction: 'ltr' })
syncRef(computed(() => mergedProps.value?.contextMenuConfig), contextMenuConfig, { direction: 'ltr' })

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
  <Tree
    ref="treeEl"
    v-bind="mergedProps.treeProps"
    v-model="model"
    v-model:search="search"
    v-model:selection="nodeSelected"
    :dnd-config="{
      getParentNode,
      onBeforeMove: handleItemMove,
      ...mergedProps.treeProps?.dndConfig,
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
      >
        <template #append>
          <slot
            name="append"
            :node
          />
        </template>
      </TreeDmsNodeFolder>

      <TreeDmsNodeFile
        v-else
        :node
      >
        <template #icon>
          <slot
            name="icon"
            :node
          />
        </template>

        <template #append>
          <slot
            name="append"
            :node
          />
        </template>
      </TreeDmsNodeFile>
    </template>

    <template #inner>
      <TreeDmsContextMenu v-if="contextMenuConfig?.enabled">
        <template #context-menu-item>
          <slot
            name="context-menu-item"
            :node="nodeContextMenu?.ref"
          />
        </template>
      </TreeDmsContextMenu>

      <TreeDmsDropZone
        v-model="model"
        :tree-props="mergedProps.treeProps"
        :drop-zone-config="mergedProps.dropZoneConfig"
        :file-key
        :folder-key
      />
    </template>
  </Tree>
</template>
