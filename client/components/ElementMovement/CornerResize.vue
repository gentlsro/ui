<!-- eslint-disable antfu/consistent-list-newline -->
<script setup lang="ts">
// Types
import type { Corner } from './types/corner.type'
import type { ICornerResizeProps } from './types/corner-resize-props.type'

const props = defineProps<ICornerResizeProps>()
const emits = defineEmits<{
  (e: 'update:modelValue', value: ICornerResizeProps['modelValue']): void
}>()

// Template
const corners = defineModel<ICornerResizeProps['modelValue']>({
  default: () => ({
    // Top
    nw: 0, n: 0, ne: 0,

    // Middle
    w: 0, e: 0,

    // Bottom
    sw: 0, s: 0, se: 0,
  }),
})

const resizeHandlesEl = ref<HTMLElement>()

const { useCornerAdjustment } = await import('./composables/useCornerAdjustment')

const { onCornerMouseDown } = useCornerAdjustment({
  corners,
  referenceEl: resizeHandlesEl.value as unknown as HTMLElement,
  limits: props.limits,
  step: props.step,
  inverted: props.inverted,
})

function handleMouseDown(payload: {
  ev: MouseEvent | TouchEvent
  corner: Corner
}) {
  onCornerMouseDown(payload.corner, payload.ev)
}

// Helper to check if a corner exists in the model
function hasCorner(corner: Corner): boolean {
  return corner in (corners.value || {})
}
</script>

<template>
  <div
    ref="resizeHandlesEl"
    class="resize-handles"
  >
    <!-- Top -->
    <span
      v-if="hasCorner('nw') || hasCorner('n') || hasCorner('ne')"
      class="resize-handles__top"
    >
      <div
        v-if="hasCorner('nw')"
        class="resize-handles__top-left handle cursor-nw-resize"
        @mousedown.stop.prevent="handleMouseDown({ ev: $event, corner: 'nw' })"
      />
      <div
        v-if="hasCorner('n')"
        class="resize-handles__top-center grow handle cursor-n-resize"
        @mousedown.stop.prevent="handleMouseDown({ ev: $event, corner: 'n' })"
      />
      <div
        v-if="hasCorner('ne')"
        class="resize-handles__top-right handle cursor-ne-resize"
        @mousedown.stop.prevent="handleMouseDown({ ev: $event, corner: 'ne' })"
      />
    </span>

    <!-- Middle - Vertical -->
    <span
      v-if="hasCorner('w') || hasCorner('e')"
      class="resize-handles__middle"
    >
      <div
        v-if="hasCorner('w')"
        class="resize-handles__middle-left !h-full handle cursor-w-resize"
        @mousedown.stop.prevent="handleMouseDown({ ev: $event, corner: 'w' })"
      />
      <div
        v-if="hasCorner('e')"
        class="resize-handles__middle-right !h-full handle cursor-e-resize"
        @mousedown.stop.prevent="handleMouseDown({ ev: $event, corner: 'e' })"
      />
    </span>

    <!-- Bottom -->
    <span
      v-if="hasCorner('sw') || hasCorner('s') || hasCorner('se')"
      class="resize-handles__bottom"
    >
      <div
        v-if="hasCorner('sw')"
        class="resize-handles__bottom-left handle cursor-sw-resize"
        @mousedown.stop.prevent="handleMouseDown({ ev: $event, corner: 'sw' })"
      />
      <div
        v-if="hasCorner('s')"
        class="resize-handles__bottom-center grow handle cursor-s-resize"
        @mousedown.stop.prevent="handleMouseDown({ ev: $event, corner: 's' })"
      />
      <div
        v-if="hasCorner('se')"
        class="resize-handles__bottom-right handle cursor-se-resize"
        @mousedown.stop.prevent="handleMouseDown({ ev: $event, corner: 'se' })"
      />
    </span>
  </div>
</template>

<style scoped lang="scss">
.resize-handles {
  @apply absolute pointer-events-none bg-transparent inset-0 z-2;

  &__top,
  &__bottom,
  &__middle {
    @apply absolute pointer-events-none bg-transparent;
    @apply flex justify-between left-0 right-0;
  }

  &__top {
    @apply top-0 items-center;
  }

  &__bottom {
    @apply bottom-0 items-center;
  }

  &__middle {
    @apply top-3 bottom-3;
  }
}

.handle {
  @apply w-3 h-3 pointer-events-auto;

  &:hover {
    @apply bg-primary/50;
  }
}
</style>
