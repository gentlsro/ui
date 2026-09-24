<script setup lang="ts">

</script>

<template>
  <div class="table-empty">
    <div class="table-empty__icon">
      <div class="i-lucide:inbox w-5 h-5" />
    </div>

    <span class="table-empty__label">
      {{ $t('general.noData') }}
    </span>
  </div>
</template>

<style scoped lang="scss">
.table-empty {
  @apply grow flex flex-col items-center justify-center gap-2 p-y-10;

  &__icon {
    @apply flex flex-center w-10 h-10 rounded-full bg-true-gray-100 dark:bg-true-gray-800
      color-true-gray-400 dark:color-true-gray-500;
  }

  &__label {
    @apply text-sm color-true-gray-500 dark:color-true-gray-400;
  }
}
</style>
