<script setup lang="ts">
// Types
import type { ISeparatorProps } from './types/separator-props.type'

// Functions
import { getComponentProps } from '../../functions/get-component-props'

const props = withDefaults(defineProps<ISeparatorProps>(), {
  ...getComponentProps('separator'),
})

const classes = computed(() => {
  return [
    props.vertical ? 'separator-vertical' : 'separator-horizontal',
    {
      'separator--spaced': props.spaced,
      'separator--inset': props.inset,
    },
  ]
})
</script>

<template>
  <span
    class="separator"
    :class="classes"
  >
    &#8203;
  </span>
</template>

<style lang="scss" scoped>
.separator {
  @apply flex border-true-gray/40 rounded-full;

  &-horizontal {
    @apply w-full border-b-1;

    line-height: 0;

    &.separator--spaced {
      @apply m-b-.5 p-b-.5;
    }

    &.separator--inset {
      @apply m-x-2 w-[calc(100%-1rem)];
    }
  }

  &-vertical {
    @apply border-r-1;

    &.separator--spaced {
      @apply p-r-.5 m-r-.5;
    }

    &.separator--inset {
      @apply m-y-1;
    }
  }
}
</style>
