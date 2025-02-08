<script setup lang="ts">
// Types
import type { ICollapseProps } from './types/collapse-props.type'

type IProps = Pick<ICollapseProps, 'ui' | 'floating'>
  & { isOpen: boolean, inTransition?: boolean }

const props = defineProps<IProps>()

// Layout
const contentClass = computed(() => {
  return props.ui?.contentClass?.(props.isOpen)
})

const contentStyle = computed(() => {
  return props.ui?.contentStyle?.(props.isOpen)
})
</script>

<template>
  <div
    class="collapse__content"
    :class="{ 'is-floating': floating, 'in-transition': inTransition }"
    :data-state="isOpen ? 'open' : 'closed'"
  >
    <span>
      <div
        class="collapse__content-inner"
        :class="contentClass"
        :style="contentStyle"
      >
        <slot />
      </div>
    </span>
  </div>
</template>

<style lang="scss" scoped>
// Transition
$TransitionProperty: grid-template-rows;
$transitionTimingFunction: cubic-bezier(0.4, 0, 0.2, 1);
$transitionDuration: 150ms;

.collapse__content {
  @apply grid;

  grid-template-rows: 0fr;

  &.is-floating {
    @apply absolute left-0 right-0 bottom-0 translate-y-full;
  }

  transition-property: $TransitionProperty;
  transition-timing-function: $transitionTimingFunction;
  transition-duration: $transitionDuration;

  .collapse__content-inner {
    @apply flex flex-col overflow-auto rounded-b-custom;
    @apply min-h-0 transition-visibility invisible;
  }

  &.in-transition {
    .collapse__content-inner {
      @apply overflow-hidden;
    }
  }
}

.collapse__content[data-state='open'] {
  grid-template-rows: 1fr;

  .collapse__content-inner {
    @apply visible;
  }
}
</style>
