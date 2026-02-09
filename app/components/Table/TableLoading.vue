<script setup lang="ts">

</script>

<template>
  <div class="table-loading">
    <LoaderBlock size="xl" />
  </div>
</template>

<style scoped lang="scss">
.table-loading {
  @apply absolute inset-0 flex flex-center
    bg-white/68 dark:bg-dark-950/87 backdrop-blur-sm;
}
</style>
