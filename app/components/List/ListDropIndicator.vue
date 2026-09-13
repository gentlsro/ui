<script setup lang="ts" vapor>
// Store
import { useListStore } from './stores/list.store'

const { dragMeta } = useListStore()
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
        'rotate-180 -top-5px': dragMeta.placement === 'above',
      }"
    >
      <div class="list-drop-indicator__arrow" />
    </div>
  </div>
</template>

<style lang="scss" scoped>
.list-drop-indicator {
  @apply absolute z-1 right-0 h-2px bg-primary pointer-events-none;

  // Rows and indicator share the content origin; scroller padding is already outside it.
  top: 0;
  transform: translateY(calc(var(--translateY) * 1px));
  left: 12px;
}

.list-drop-indicator__icon {
  @apply w-4 h-4 relative left--3 rounded-custom
  color-primary bg-white dark:bg-darker;
}
// The SVG tip is at y=15/24 (9/24 after rotation). At 16px, offsets
// of -9px/-5px place it on the 2px line's center. Override the icon preset's 1.2rem size.
.list-drop-indicator__arrow {
  @apply i-tabler:arrow-back w-full h-full;
}
</style>
