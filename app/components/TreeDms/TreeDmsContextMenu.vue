<script setup lang="ts" vapor>
import type { AllowedComponentProps } from 'vue'
import type { IBtnProps } from '../Button/types/btn-props.type'
import type { ITreeNode } from '../Tree/types/tree-node.type'

// Store
import { useTreeDmsStore } from './stores/tree-dms.store'
import { useTreeStore } from '../Tree/stores/tree.store'
import { isNodeSelected } from '../Tree/functions/is-node-selected'

type IBtnContextMenuOption = IBtnProps
  & AllowedComponentProps
  & { id: string, onClick?: () => void }

// Store
const {
  selection,
  idKey,
  labelKey,
  childrenKey,
  selectionConfig,
  insertNode,
  removeNode,
  expandNode,
} = useTreeStore()

const {
  isContextMenuOpen,
  nodeContextMenu,
  nodeEditing,
  fileKey,
  folderKey,
  modifiers,
  isCurrentlyAddingItem,
  contextMenuConfig,
} = useTreeDmsStore()

// Layout
const menuEl = useTemplateRef('menuEl')
const isDelete = ref(false)

async function createItem(type: string, parent?: ITreeNode) {
  if (isCurrentlyAddingItem.value) {
    return
  }

  if (parent) {
    expandNode(parent)
  }

  const addedNode = await insertNode(
    {
      [idKey.value]: generateUUID(),
      [labelKey.value]: '',
      type,
      [childrenKey.value]: [],
      ...contextMenuConfig.value?.newItem?.({ type, parent: parent?.ref }),
      __isNew: true,
    },
    { parent },
  )

  requestAnimationFrame(() => {
    nodeEditing.value = addedNode
  })
  $hide()
}

const menuItems = computed<Array<IBtnContextMenuOption>>(() => {
  const baseProps: IBtnProps = { size: 'sm', noUppercase: true, align: 'left' }
  const item = nodeContextMenu.value?.ref

  const newFileOption: IBtnContextMenuOption = {
    ...baseProps,
    id: 'new-file',
    icon: 'i-hugeicons:file-add',
    label: $t('misc.createFile'),
    onClick: () => createItem(fileKey.value, nodeContextMenu.value),
    style: 'order: 10;',
  }

  const newFolderOption: IBtnContextMenuOption = {
    ...baseProps,
    id: 'new-folder',
    icon: 'i-hugeicons:folder-add',
    label: $t('misc.createFolder'),
    onClick: () => createItem(folderKey.value, nodeContextMenu.value),
    style: 'order: 20;',
  }

  const renameOption = (order: number): IBtnContextMenuOption => ({
    ...baseProps,
    id: 'rename',
    icon: 'i-fluent:rename-16-regular',
    label: $t('general.rename'),
    onClick: () => {
      nodeEditing.value = nodeContextMenu.value
      $hide()
    },
    style: `order: ${order};`,
  })

  const deleteOption = (order: number): IBtnContextMenuOption => ({
    ...baseProps,
    id: 'delete',
    label: $t('general.delete'),
    preset: 'TRASH',
    class: 'color-negative',
    onClick: () => {
      isDelete.value = true
    },
    style: `order: ${order};`,
  })

  let options: Array<IBtnContextMenuOption>

  switch (item?.type) {
    case fileKey.value:
      options = [
        ...(contextMenuConfig.value?.extendOptions?.({ item }) ?? []),
        renameOption(10),
        deleteOption(20),
      ]
      break

    case folderKey.value:
      options = [
        ...(contextMenuConfig.value?.extendOptions?.({ item }) ?? []),
        newFileOption,
        newFolderOption,
        renameOption(30),
        deleteOption(40),
      ]
      break

    default:
      options = [
        ...(contextMenuConfig.value?.extendOptions?.({}) ?? []),
        newFileOption,
        newFolderOption,
      ]
  }

  return contextMenuConfig.value?.getOptions?.({ item, options }) ?? options
})

whenever(nodeContextMenu, () => {
  if (menuEl.value) {
    menuEl.value.recomputePosition()
  }
})

function handleHide() {
  isDelete.value = false
}

async function handleDelete() {
  if (!nodeContextMenu.value) {
    return
  }

  if (modifiers.value?.onItemDelete) {
    try {
      await modifiers.value?.onItemDelete?.({ item: nodeContextMenu.value?.ref })
    } catch {
      return
    }
  }

  const isSelected = isNodeSelected({
    node: nodeContextMenu.value,
    selection: selection.value,
    idKey: 'id',
    selectionConfig: selectionConfig.value,
  })

  removeNode(nodeContextMenu.value)
  isDelete.value = false
  nodeContextMenu.value = undefined

  if (isSelected) {
    selection.value = undefined
  }

  $hide()
}
</script>

<template>
  <Menu
    ref="menuEl"
    v-model="isContextMenuOpen"
    manual
    placement="right-start"
    no-transition
    :offset="0"
    :virtual-config="{ enabled: true }"
    @hide="handleHide"
  >
    <!-- To delete -->
    <div
      v-if="isDelete"
      flex="~ col gap-2 p-4"
      max-w="60"
      relative
    >
      <Btn
        preset="BACK"
        size="sm"
        class="!absolute top-0 left-0"
        @click="isDelete = false"
      />

      <div flex="~ center">
        <div class="i-clarity:warning-solid w-8 h-8 color-negative" />
      </div>

      <span
        text="caption center"
        font="rem-12"
      >
        {{ $t('general.deleteItemConfirmation') }}
      </span>

      <Btn
        :label="$t('general.delete')"
        bg="negative"
        color="white"
        size="sm"
        @click="handleDelete"
      />
    </div>
    <!-- Selected -->
    <template v-else>
      <slot
        name="context-menu-item"
        :node="nodeContextMenu?.ref"
      />

      <Btn
        v-for="item in menuItems"
        v-bind="item"
        :key="item.id"
      />
    </template>
  </Menu>
</template>
