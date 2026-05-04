<script setup lang="ts">
import type { IBtnProps } from '../Button/types/btn-props.type'

// Store
import { useTreeDmsStore } from './stores/tree-dms.store'
import { useTreeStore } from '../Tree/stores/tree.store'

// Store
const {
  selection,
  idKey,
  childrenKey,
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

const menuItems = computed<Array<IBtnProps & { id: string }>>(() => {
  const baseProps: IBtnProps = { size: 'sm', noUppercase: true, align: 'left' }

  switch (nodeContextMenu.value?.ref.type) {
    case fileKey.value:
      return [
        ...(contextMenuConfig.value?.extendOptions?.({ item: nodeContextMenu.value?.ref }) ?? []),

        // Rename
        {
          ...baseProps,
          id: 'rename',
          icon: 'i-fluent:rename-16-regular',
          label: $t('general.rename'),
          onClick: () => {
            nodeEditing.value = nodeContextMenu.value
            $hide()
          },
          style: 'order: 10;',
        },
        // Delete
        {
          ...baseProps,
          id: 'delete',
          label: $t('general.delete'),
          preset: 'TRASH',
          onClick: () => {
            isDelete.value = true
          },
          style: 'order: 20;',
        },
      ]

    case folderKey.value:
      return [
        ...(contextMenuConfig.value?.extendOptions?.({ item: nodeContextMenu.value?.ref }) ?? []),

        // New file
        {
          ...baseProps,
          id: 'new-file',
          icon: 'i-hugeicons:file-add',
          label: $t('misc.createFile'),
          onClick: async () => {
            if (!nodeContextMenu.value || isCurrentlyAddingItem.value) {
              return
            }

            const id = generateUUID()
            expandNode(nodeContextMenu.value)

            const addedNode = await insertNode(
              { [idKey.value]: id, label: '', type: fileKey.value, [childrenKey.value]: [], __isNew: true },
              { parent: nodeContextMenu.value },
            )

            requestAnimationFrame(() => {
              nodeEditing.value = addedNode
            })
            $hide()
          },
          style: 'order: 10;',
        },
        // New folder
        {
          ...baseProps,
          id: 'new-folder',
          icon: 'i-hugeicons:folder-add',
          label: $t('misc.createFolder'),
          onClick: async () => {
            if (!nodeContextMenu.value || isCurrentlyAddingItem.value) {
              return
            }

            const id = generateUUID()
            expandNode(nodeContextMenu.value)

            const addedNode = await insertNode(
              { [idKey.value]: id, label: '', type: folderKey.value, [childrenKey.value]: [], __isNew: true },
              { parent: nodeContextMenu.value },
            )

            requestAnimationFrame(() => {
              nodeEditing.value = addedNode
            })
            $hide()
          },
          style: 'order: 20;',
        },
        // Rename
        {
          ...baseProps,
          id: 'rename',
          icon: 'i-fluent:rename-16-regular',
          label: $t('general.rename'),
          onClick: () => {
            nodeEditing.value = nodeContextMenu.value
            $hide()
          },
          style: 'order: 30;',
        },
        // Delete
        {
          ...baseProps,
          id: 'delete',
          label: $t('general.delete'),
          preset: 'TRASH',
          class: 'color-negative',
          onClick: () => {
            isDelete.value = true
          },
          style: 'order: 40;',
        },
      ]

    default:
      return [
        ...(contextMenuConfig.value?.extendOptions?.({}) ?? []),

        // New file
        {
          ...baseProps,
          id: 'new-file',
          icon: 'i-hugeicons:file-add',
          label: $t('misc.createFile'),
          onClick: async () => {
            if (isCurrentlyAddingItem.value) {
              return
            }

            const id = generateUUID()

            const addedNode = await insertNode(
              { [idKey.value]: id, label: '', type: fileKey.value, [childrenKey.value]: [], __isNew: true },
              { parent: nodeContextMenu.value },
            )

            requestAnimationFrame(() => {
              nodeEditing.value = addedNode
            })
            $hide()
          },
          style: 'order: 10;',
        },
        // New folder
        {
          ...baseProps,
          id: 'new-folder',
          icon: 'i-hugeicons:folder-add',
          label: $t('misc.createFolder'),
          onClick: async () => {
            if (isCurrentlyAddingItem.value) {
              return
            }

            const id = generateUUID()

            const addedNode = await insertNode(
              { [idKey.value]: id, label: '', type: folderKey.value, [childrenKey.value]: [], __isNew: true },
              { parent: nodeContextMenu.value },
            )

            requestAnimationFrame(() => {
              nodeEditing.value = addedNode
            })
            $hide()
          },
          style: 'order: 20;',
        },
      ]
  }
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

  removeNode(nodeContextMenu.value)
  isDelete.value = false
  selection.value = undefined
  nodeContextMenu.value = undefined
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
