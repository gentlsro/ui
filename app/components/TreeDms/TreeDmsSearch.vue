<script setup lang="ts" generic="T extends IItem = IItem">
// Types
import type { ITreeProps } from '../Tree/types/tree-props.type'

// Store
import { useTreeStore } from '../Tree/stores/tree.store'
import { useTreeDmsStore } from './stores/tree-dms.store'

type IProps = Pick<ITreeProps<T>, 'search' | 'searchConfig' | 'ui' | 'actionsConfig'>
  & { label?: string | (() => string) }

const props = defineProps<IProps>()
defineEmits<{
  (e: 'update:search', val: string): void
}>()

// Store
const { fileKey, folderKey, nodeEditing, isCurrentlyAddingItem } = useTreeDmsStore()
const { insertNode, childrenKey } = useTreeStore()

// Layout
const search = defineModel<string>('search')

const label = computed(() => {
  return typeof props.label === 'function' ? props.label() : props.label
})

async function handleCreateItem(type: string) {
  if (isCurrentlyAddingItem.value) {
    return
  }

  const addedNode = await insertNode({
    id: generateUUID(),
    label: '',
    type,
    [childrenKey.value]: [],

    __isNew: true,
  })

  isCurrentlyAddingItem.value = true

  requestAnimationFrame(() => {
    nodeEditing.value = addedNode
  })
}
</script>

<template>
  <TreeSearch
    v-model:search="search"
    :ui
    :search-config
    :actions-config
  >
    <template #actions>
      <div class="tree-dms__header">
        <h6 v-if="label">
          {{ label }}
        </h6>

        <TreeActions
          :ui
          :actions-config
          m="l-auto"
        >
          <template #append>
            <!-- Add file -->
            <Btn
              v-bind="actionsConfig?.btnProps"
              size="xs"
              icon="i-hugeicons:file-add"
              :tooltip="{ label: $t('misc.createFile') }"
              @click="handleCreateItem(fileKey)"
            />

            <!-- Add folder -->
            <Btn
              v-bind="actionsConfig?.btnProps"
              size="xs"
              icon="i-hugeicons:folder-add"
              :tooltip="{ label: $t('misc.createFolder') }"
              @click="handleCreateItem(folderKey)"
            />
          </template>
        </TreeActions>
      </div>
    </template>
  </TreeSearch>
</template>

<style scoped lang="scss">
.tree-dms__header {
  @apply flex items-center order-first p-l-4 p-r-2 p-y-1 rounded-t-custom m-b-1;
  @apply bg-slate-700 dark:bg-black color-white;
}
</style>
