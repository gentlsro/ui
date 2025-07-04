<script setup lang="ts">
import type { ITreeProps } from '$ui'

type IProps = Pick<ITreeProps, 'search' | 'searchConfig'>

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
