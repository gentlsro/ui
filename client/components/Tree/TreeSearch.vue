<script setup lang="ts">
type IProps = {
  search?: string
}

defineProps<IProps>()

// Layout
const search = defineModel<string>('search')
</script>

<template>
  <div class="tree-search">
    <SearchInput
      v-model="search"
      autofocus
    />
  </div>
</template>
