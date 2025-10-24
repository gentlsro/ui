<script setup lang="ts" generic="T extends IItem = IItem">
// Types
import type { ITreeProps } from './types/tree-props.type'

type IProps = Pick<ITreeProps<T>, 'search' | 'searchConfig'>

defineProps<IProps>()

// Layout
const search = defineModel<string>('search')
</script>

<template>
  <SearchInput
    v-model="search"
    autofocus
    v-bind="searchConfig?.props"
    class="tree-search"
  />
</template>
