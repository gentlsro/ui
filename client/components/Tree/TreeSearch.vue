<script setup lang="ts" generic="T extends IItem = IItem">
import type { ITreeProps } from '$ui'

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
  />
</template>
