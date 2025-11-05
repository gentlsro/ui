<script setup lang="ts" generic="T extends IItem = IItem">
// Types
import type { ITreeProps } from './types/tree-props.type'

// Store
import { useTreeStore } from './stores/tree.store'

type IProps = Pick<ITreeProps<T>, 'search' | 'searchConfig'>

defineProps<IProps>()

// Store
const { searchEl } = storeToRefs(useTreeStore())

// Layout
const search = defineModel<string>('search')

defineExpose({
  focus: () => searchEl.value?.focus(),
})
</script>

<template>
  <SearchInput
    ref="searchEl"
    v-model="search"
    autofocus
    v-bind="searchConfig?.props"
    class="tree-search"
  />
</template>
