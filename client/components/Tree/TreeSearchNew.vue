<script setup lang="ts" generic="T extends IItem = IItem">
// Types
import type { ITreeProps } from './types/tree-props.new.type'

// Store
import { useTreeStore } from './stores/tree.store.new'

type IProps = Pick<ITreeProps<T>, 'search' | 'searchConfig' | 'ui' | 'actionsConfig'>

defineProps<IProps>()

// Store
const { searchEl } = useTreeStore()

// Layout
const search = defineModel<string>('search')

defineExpose({
  focus: () => searchEl.value?.focus(),
})
</script>

<template>
  <div class="tree-search">
    <SearchInput
      ref="searchEl"
      v-model="search"
      autofocus
      grow
      v-bind="searchConfig?.props"
    />

    <slot name="actions">
      <!-- <TreeActions
        v-if="actionsConfig?.enabled"
        :ui
        :actions-config
      /> -->
    </slot>
  </div>
</template>

<style scoped lang="scss">
.tree-search {
  @apply flex gap-1 items-center;
}
</style>
