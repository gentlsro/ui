<script setup lang="ts">
type IProps = {
  hasSelect: boolean
  hasFilters: boolean
  hasSorting: boolean
  isPublic: boolean
  isDefault: boolean
}

defineProps<IProps>()
</script>

<template>
  <div class="layout-meta">
    <!-- Select -->
    <div
      v-if="hasSelect"
      class="i-tabler:columns-2"
    />

    <!-- Filters -->
    <div
      v-if="hasFilters"
      class="i-ic:round-filter-alt"
    />

    <!-- Sorting -->
    <div
      v-if="hasSorting"
      class="i-basil:sort-outline m-l--2px"
    />

    <Separator
      v-if="(hasSelect || hasFilters || hasSorting) && (isPublic || isDefault)"
      vertical
      m="x-1"
    />

    <!-- Is public -->
    <div
      v-if="isPublic"
      class="i-ic:round-public"
    />

    <!-- Is default -->
    <div
      v-if="isDefault"
      class="i-fluent:book-default-28-filled"
    />
  </div>
</template>

<style scoped lang="scss">
.layout-meta {
  @apply flex items-center w-full font-rem-10 color-blue-500 gap-2px;
}
</style>
