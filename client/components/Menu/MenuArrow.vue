<script setup lang="ts">
// Store
import { useMenuStore } from './store/menu.store'

// Store
const { arrowEl } = useMenuStore()
</script>

<template>
  <div
    ref="arrowEl"
    class="menu-arrow"
  />
</template>

<style scoped lang="scss">
.menu-arrow {
  @apply absolute w-2 h-2 rotate-45 bg-white dark:bg-darker z--1;
}

// Arrow placement
.menu[placement^='top'] > .menu-arrow {
  @apply bottom--4px shadow-darker/12 shadow-light/8;
  // @apply border-b-custom border-r-custom border-ca;

  box-shadow: 1px 1px 1px 1px var(--un-shadow-color);
}

.menu[placement^='bottom'] > .menu-arrow {
  @apply top--4px shadow-darker/12 shadow-light/8;
  // @apply border-t-custom border-l-custom border-ca;

  box-shadow: -1px -1px 1px 1px var(--un-shadow-color);
}

.menu[placement^='left'] > .menu-arrow {
  @apply right--4px shadow-darker/12 shadow-light/8;
  // @apply border-r-custom border-t-custom border-ca;

  box-shadow: 1px -1px 1px 1px var(--un-shadow-color);
}

.menu[placement^='right'] > .menu-arrow {
  @apply left--4px shadow-darker/12 shadow-light/8;
  // @apply border-l-custom border-b-custom border-ca;

  box-shadow: -1px 1px 1px 1px var(--un-shadow-color);
}
</style>
