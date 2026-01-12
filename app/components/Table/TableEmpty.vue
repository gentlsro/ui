<script setup lang="ts">

</script>

<template>
  <div class="table-empty">
    <Banner
      m="x-2"
      no-transition
    >
      <span text-caption>
        {{ $t('general.noData') }}
      </span>
    </Banner>
  </div>
</template>

<style scoped lang="scss">
.table-empty {
  @apply grow;
}
</style>
