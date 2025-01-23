<script setup lang="ts">
// Store
import { useListStore } from './stores/list.store'

const { dragMeta } = storeToRefs(useListStore())
</script>

<template>
  <div
    v-if="dragMeta?.targetEl"
    class="list-drop-indicator"
    :style="dragMeta?.dropIndicatorCSS"
  >
    <div
      class="list-drop-indicator__icon"
      :class="{
        'rotate-y-180 -top-9px': dragMeta.placement === 'below',
        'rotate-180 -top-6px': dragMeta.placement === 'above',
      }"
    >
      <div i-tabler:arrow-back />
    </div>
  </div>
</template>

<style lang="scss" scoped>
.list-drop-indicator {
  @apply absolute z-1 right-0 h-2px bg-primary pointer-events-none;

  transform: translateY(calc(var(--translateY) * 1px));
  left: 12px;

  &__icon {
    @apply w-4 h-4 relative left--3 rounded-custom
    color-primary bg-white dark:bg-darker;
  }
}
</style>
