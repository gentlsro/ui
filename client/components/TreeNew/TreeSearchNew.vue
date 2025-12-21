<script setup lang="ts" generic="T extends IItem = IItem">
// Types
import type { ITreeProps } from './types/tree-props.new.type'

// Store
import { useTreeStore } from './stores/tree.store.new'

// Constants
import { TREE_NEW_DEFAULT_PROPS } from './constants/tree-new-default-props.constant'

type IProps = Pick<ITreeProps<T>, 'search' | 'searchConfig' | 'ui' | 'actionsConfig'>

const props = defineProps<IProps>()

// Store
const { searchEl } = useTreeStore()

// Layout
const search = defineModel<string>('search')

// Styles - Search
const searchClass = computed(() => {
  return props.ui?.searchClass?.({
    defaults: TREE_NEW_DEFAULT_PROPS.ui.searchClass(),
  })
})

const searchStyle = computed(() => {
  return props.ui?.searchStyle?.()
})

defineExpose({
  focus: () => searchEl.value?.focus(),
})
</script>

<template>
  <div
    class="tree-search"
    :class="searchClass"
    :style="searchStyle"
  >
    <SearchInput
      ref="searchEl"
      v-model="search"
      autofocus
      grow
      data-tree-search
      v-bind="searchConfig?.inputProps"
    />

    <slot name="actions">
      <TreeActions
        v-if="actionsConfig?.enabled"
        :ui
        :actions-config
      />
    </slot>
  </div>
</template>
