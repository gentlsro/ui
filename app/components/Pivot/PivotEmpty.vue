<template>
  <div class="pivot-empty">
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
.pivot-empty {
  @apply grow;
}
</style>
