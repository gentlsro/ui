<script setup lang="ts">
// Store
import { useTreeStore } from './stores/tree.store'

type IProps = {
  search?: string
}

defineProps<IProps>()

// Store
const { search: storeSearch, nodes } = storeToRefs(useTreeStore())

// Layout
const search = defineModel<string>('search')

syncRef(search, storeSearch, { direction: 'both' })
</script>

<template>
  <div class="tree-search">
    <SearchInput v-model="search" />
  </div>
</template>
