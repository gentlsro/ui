<script setup lang="ts">
// Store
import { useListStore } from './stores/list.store'

const { isFirstFetch, items, isLoading } = storeToRefs(useListStore())
</script>

<template>
  <div
    v-if="isFirstFetch && !items.length && isLoading"
    class="list-loading"
  >
    <LoaderBlock
      size="md"
    />
  </div>
</template>

<style scoped lang="scss">
.list-loading {
  @apply flex flex-center p-y-3;
}
</style>
