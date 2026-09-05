<script setup lang="ts" vapor>
import type { NonUndefined } from 'utility-types'
import { useElementMovement } from './composables/useElementMovement'

// Types
import type { IElementMovementProps, IElementResizeHandle } from './types/element-movement-props.type'

const props = withDefaults(defineProps<IElementMovementProps>(), {
  ...getComponentProps('elementMovement'),
})

const DEFAULT_HANDLES: IElementResizeHandle[] = ['nw', 'n', 'ne', 'w', 'e', 'sw', 's', 'se']

// Template
const dimensions = defineModel<NonUndefined<IElementMovementProps['dimensions']>>(
  'dimensions',
  { default: () => ({ x: 0, y: 0, w: 0, h: 0 }) },
)
const resizeHandlesEl = useTemplateRef<HTMLDivElement>('resizeHandlesEl')

useElementMovement({
  resizeHandles: resizeHandlesEl,
  dimensions,
  referenceEl: resizeHandlesEl,
  constrainToPage: props.constrainToPage,
  limits: {
    minW: props.limits?.minW,
    minH: props.limits?.minH,
    maxW: props.limits?.maxW,
    maxH: props.limits?.maxH,
  },
})

function hasHandle(handle: IElementResizeHandle) {
  return (props.handles ?? DEFAULT_HANDLES).includes(handle)
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
        v-if="hasHandle('nw')"
        class="resize-handles__top-left handle cursor-nw-resize rounded-br-1"
        data-resize-corner="nw"
      />
      <div
        v-if="hasHandle('n')"
        class="resize-handles__top-center grow handle cursor-n-resize rounded-b-1"
        data-resize-corner="n"
      />
      <div
        v-if="hasHandle('ne')"
        class="resize-handles__top-right handle cursor-ne-resize rounded-bl-1"
        data-resize-corner="ne"
      />
    </span>

    <!-- Middle - Vertical -->
    <span class="resize-handles__middle">
      <div
        v-if="hasHandle('w')"
        class="resize-handles__middle-left !h-full handle cursor-w-resize rounded-r-1"
        data-resize-corner="w"
      />
      <div
        v-if="hasHandle('e')"
        class="resize-handles__middle-right ml-auto !h-full handle cursor-e-resize rounded-l-1"
        data-resize-corner="e"
      />
    </span>

    <!-- Bottom -->
    <span class="resize-handles__bottom">
      <div
        v-if="hasHandle('sw')"
        class="resize-handles__bottom-left handle cursor-sw-resize rounded-tr-1"
        data-resize-corner="sw"
      />
      <div
        v-if="hasHandle('s')"
        class="resize-handles__bottom-center grow handle cursor-s-resize rounded-t-1"
        data-resize-corner="s"
      />
      <div
        v-if="hasHandle('se')"
        class="resize-handles__bottom-right handle cursor-se-resize rounded-tl-1"
        data-resize-corner="se"
      />
    </span>
  </div>
</template>

<style scoped lang="scss">
.resize-handles {
  @apply absolute pointer-events-none bg-transparent inset-0 z-1;

  &__top,
  &__bottom,
  &__middle {
    @apply absolute pointer-events-none bg-transparent
      flex justify-between left-0 right-0;
  }

  &__top {
    @apply top-0 items-center;
  }

  &__bottom {
    @apply bottom-0 items-center;
  }

  &__middle {
    @apply top-1 bottom-1;
  }
}

.handle {
  @apply w-1 h-1 min-w-1 min-h-1 pointer-events-auto touch-none;

  &:hover {
    @apply bg-primary/50;
  }
}
</style>
