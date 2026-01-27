<script setup lang="ts" generic="T extends IItem = IItem">
// Types
import type { ITreeDmsProps } from './types/tree-dms-props.type'

// Functions
import { handleItemDrop } from './functions/handle-item-drop'

// Store
import { useTreeStore } from '../Tree/stores/tree.store'

type IProps = Pick<ITreeDmsProps<T>, 'modelValue' | 'fileKey' | 'folderKey' | 'treeProps' | 'dropZoneConfig'>

const props = defineProps<IProps>()

// Store
const { treeEl } = useTreeStore()

// Utils
const { fnc = handleItemDrop } = props.dropZoneConfig ?? {}

const childrenKey = props.treeProps?.childrenKey ?? 'children'

function handleStructureItemCreated(payload: {
  item: T
  parentItem?: T | null
}) {
  const { item, parentItem } = payload

  const parent = parentItem?.type === StructureItemType.FOLDER ? parentItem : undefined

  if (parent) {
    // @ts-expect-error
    parent[childrenKey] = [...(parent[childrenKey] ?? []), item]

    model.value = [...model.value ?? []]
  } else {
    model.value = [...(model.value ?? []), item]
  }
}

// Layout
const model = defineModel<T[]>()

const { isOverDropZone } = useDropZone(
  () => unrefElement(treeEl) as HTMLElement,
  {
    multiple: true,
    onDrop: async (_, e) => {
      const items = (e.dataTransfer?.items ?? []) as DataTransferItemList

      const createdParentByName: Record<string, T> = {}

      processDroppedItems(items, async (item, parentItem, file) => {
        const isFile = 'type' in item

        // File
        if (isFile) {
          if (!file) {
            return
          }

          const parent = createdParentByName[parentItem?.name ?? '']

          // Upload the file
          const res = await fnc({
            item,
            file,
            parent,
            fileKey: props.fileKey,
            folderKey: props.folderKey,
          }) as T

          handleStructureItemCreated({ item: res, parentItem: parent })
        }

        // Directory
        else {
          const parent = createdParentByName[parentItem?.name ?? '']

          const res = await fnc({
            item,
            parent,
            fileKey: props.fileKey,
            folderKey: props.folderKey,
          }) as T

          createdParentByName[item.name] = res
          handleStructureItemCreated({ item: res, parentItem: parent })
        }
      })
    },
  },
)
</script>

<template>
  <div
    class="drop-zone"
    :class="{ 'is-over': isOverDropZone }"
  >
    <template v-if="isOverDropZone">
      <div class="i-eva:plus-fill w-8 h-8" />
      <span>
        {{ $t('general.uploadFile', 2) }}
      </span>
    </template>
  </div>
</template>

<style scoped lang="scss">
.drop-zone {
  @apply absolute inset-0 flex items-center flex-col gap-2 p-t-2/10 z--1;

  &.is-over {
    @apply bg-white/95 dark:bg-dark-950/95 backdrop-blur-sm rounded-inherit
    border-2 border-dashed border-true-gray-300 dark:border-true-gray-600 z-1;
  }
}
</style>
