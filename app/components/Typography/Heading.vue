<script setup lang="ts">
// Types
import type { IHeadingProps } from './types/heading-props.type'

// Constants
import { HEADING_DEFAULT_PROPS } from './constants/heading-default-props.constant'

const props = withDefaults(defineProps<IHeadingProps>(), {
  ...getComponentProps('heading'),
})

// Utils
const mergedProps = computed(() => {
  return getComponentMergedProps('heading', props)
})

const classes = computed(() => {
  return [
    { 'is-filled': props.filled, 'is-highlighted': props.highlighted },
  ]
})

// Styles - container
const containerClass = computed(() => {
  return mergedProps.value?.ui?.containerClass?.({
    defaults: HEADING_DEFAULT_PROPS.ui.containerClass(),
  })
})

const containerStyle = computed(() => {
  return mergedProps.value?.ui?.containerStyle?.()
})
</script>

<template>
  <h6
    class="heading group/heading"
    :class="[classes, containerClass]"
    :style="containerStyle"
  >
    <slot />
  </h6>
</template>

<style lang="scss" scoped>
.heading.is-highlighted {
  &::before {
    @apply bottom-0 w-9/10 h-1 left-0 bg-primary content-empty absolute
      rounded-full
      bg-gradient-to-r from-primary to-true-gray-100;
  }
}

.dark .heading {
  &::before {
    @apply to-true-gray-800;
  }
}

.heading.is-filled {
  &::before {
    content: unset;
  }
}
</style>
