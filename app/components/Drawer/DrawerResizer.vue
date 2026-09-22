<script setup lang="ts">
type IProps = {
  /**
   * The side the drawer sits on ~ the resizer hugs the opposite (inner) edge
   *
   * @default 'right'
   */
  side?: 'left' | 'right'

  /**
   * Whether the drawer is currently being resized
   */
  isResizing?: boolean
}

const props = withDefaults(defineProps<IProps>(), {
  side: 'right',
})
</script>

<template>
  <div
    class="drawer-resizer"
    :class="[
      `drawer-resizer--${props.side}`,
      { 'is-resizing': props.isResizing },
    ]"
    role="separator"
    aria-orientation="vertical"
  />
</template>

<style lang="scss" scoped>
.drawer-resizer {
  @apply absolute inset-y-0 z-20 w-3 flex items-center justify-center cursor-col-resize
    touch-none select-none pointer-events-auto text-primary;

  // The resizer straddles the inner edge of the drawer (the opposite one)
  &--left {
    @apply right--6px;
  }

  &--right {
    @apply left--6px;
  }

  &::before,
  &::after {
    @apply content-empty pointer-events-none;
  }

  &::before {
    @apply absolute inset-y-10 left-1/2 w-2px -translate-x-1/2 rounded-full opacity-0
      transition-opacity duration-200;
    background: linear-gradient(to bottom, transparent, currentColor 18%, currentColor 82%, transparent);
  }

  &::after {
    @apply relative h-8 w-1 rounded-full bg-slate-400/45 dark:bg-white/25
      transition-all duration-150 ease-out;
  }

  &:hover::before,
  &:active::before {
    @apply opacity-40;
  }

  &:hover::after {
    @apply h-10 bg-primary;
  }

  &:active::after {
    @apply h-11 bg-primary;
  }

  &.is-resizing::before {
    @apply opacity-50;
  }

  &.is-resizing::after {
    @apply h-11 bg-primary;
  }
}
</style>
