<script setup lang="ts" generic="T extends IItem = IItem">
// Types
import type { ITreeProps } from '../Tree/types/tree-props.type'
import type { ITreeDmsProps } from './types/tree-dms-props.type'

// Store
import { useTreeStore } from '../Tree/stores/tree.store'
import { useTreeDmsStore } from './stores/tree-dms.store'

// Constants
import { TREE_DMS_DEFAULT_PROPS } from './constants/tree-dms-default-props.constant'

type IProps = Pick<ITreeProps<T>, 'search' | 'searchConfig' | 'ui' | 'actionsConfig'>
  & { label?: string | (() => string) }
  & { dmsUi?: ITreeDmsProps<T>['ui'] }

const props = defineProps<IProps>()
defineEmits<{
  (e: 'update:search', val: string): void
}>()

// Store
const { fileKey, folderKey, nodeEditing, isCurrentlyAddingItem } = useTreeDmsStore()
const { insertNode, idKey, childrenKey } = useTreeStore()

// Layout
const search = defineModel<string>('search')

const label = computed(() => {
  return typeof props.label === 'function' ? props.label() : props.label
})

const labelClass = computed(() => {
  return props.dmsUi?.labelClass?.({
    defaults: TREE_DMS_DEFAULT_PROPS.ui.labelClass(),
  })
})

const labelStyle = computed(() => {
  return props.dmsUi?.labelStyle?.()
})

async function handleCreateItem(type: string) {
  if (isCurrentlyAddingItem.value) {
    return
  }

  const addedNode = await insertNode({
    [idKey.value]: generateUUID().split('-')[0],
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
      <div
        v-if="label || actionsConfig?.enabled"
        class="tree-dms__header"
      >
        <slot name="label">
          <h6
            v-if="label"
            :class="labelClass"
            :style="labelStyle"
          >
            {{ label }}
          </h6>
        </slot>

        <TreeActions
          v-if="actionsConfig?.enabled"
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
              class="add-file-btn"
              :tooltip="{ label: $t('misc.createFile') }"
              @click="handleCreateItem(fileKey)"
            />

            <!-- Add folder -->
            <Btn
              v-bind="actionsConfig?.btnProps"
              size="xs"
              icon="i-hugeicons:folder-add"
              class="add-folder-btn"
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
  @apply flex items-center order-first p-l-3 p-r-2 p-y-1 rounded-t-custom m-b-1
    bg-slate-700 dark:bg-black color-white;
}
</style>
