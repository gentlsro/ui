<script setup lang="ts">
import type { NonUndefined } from 'utility-types'

// Types
import type { IElementMovementProps } from './types/element-movement-props.type'

// Functions
import { getComponentProps } from '../../functions/get-component-props'

type Corner = 'nw' | 'n' | 'ne' | 'w' | 'e' | 'sw' | 's' | 'se'

const props = withDefaults(defineProps<IElementMovementProps>(), {
  ...getComponentProps('elementMovement'),
})

// Template
const dimensions = defineModel<NonUndefined<IElementMovementProps['dimensions']>>(
  'dimensions',
  { default: { x: 0, y: 0, w: 0, h: 0 } },
)
const resizeHandlesEl = ref<HTMLElement>()

const { useElementMovement } = await import('./composables/useElementMovement')

const { onResizeMouseDown } = useElementMovement({
  dimensions,
  referenceEl: resizeHandlesEl.value as unknown as HTMLElement,
  limits: {
    minW: props.limits?.minW,
    minH: props.limits?.minH,
    maxW: props.limits?.maxW,
    maxH: props.limits?.maxH,
  },
})

function handleMouseDown(payload: {
  ev: MouseEvent | TouchEvent
  corner: Corner
}) {
  onResizeMouseDown(payload.corner, payload.ev)
}
</script>

<template>
  <div
    ref="resizeHandlesEl"
    class="resize-handles"
  >
    <!-- Top -->
    <span class="resize-handles__top">
      <div
        class="resize-handles__top-left handle cursor-nw-resize"
        @mousedown.stop.prevent="handleMouseDown({ ev: $event, corner: 'nw' })"
      />
      <div
        class="resize-handles__top-center grow handle cursor-n-resize"
        @mousedown.stop.prevent="handleMouseDown({ ev: $event, corner: 'n' })"
      />
      <div
        class="resize-handles__top-right handle cursor-ne-resize"
        @mousedown.stop.prevent="handleMouseDown({ ev: $event, corner: 'ne' })"
      />
    </span>

    <!-- Middle - Vertical -->
    <span class="resize-handles__middle">
      <div
        class="resize-handles__middle-left !h-full handle cursor-w-resize"
        @mousedown.stop.prevent="handleMouseDown({ ev: $event, corner: 'w' })"
      />
      <div
        class="resize-handles__middle-right !h-full handle cursor-e-resize"
        @mousedown.stop.prevent="handleMouseDown({ ev: $event, corner: 'e' })"
      />
    </span>

    <!-- Bottom -->
    <span class="resize-handles__bottom">
      <div
        class="resize-handles__bottom-left handle cursor-sw-resize"
        @mousedown.stop.prevent="handleMouseDown({ ev: $event, corner: 'sw' })"
      />
      <div
        class="resize-handles__bottom-center grow handle cursor-s-resize"
        @mousedown.stop.prevent="handleMouseDown({ ev: $event, corner: 's' })"
      />
      <div
        class="resize-handles__bottom-right handle cursor-se-resize"
        @mousedown.stop.prevent="handleMouseDown({ ev: $event, corner: 'se' })"
      />
    </span>
  </div>
</template>

<style scoped lang="scss">
.resize-handles {
  @apply absolute pointer-events-none bg-transparent inset-0;

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
