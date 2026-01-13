<script setup lang="ts">
// Types
import type { ISeparatorProps } from './types/separator-props.type'

// Constants
import { SEPARATOR_DEFAULT_PROPS } from './constants/separator-default-props.constant'

const props = withDefaults(defineProps<ISeparatorProps>(), {
  ...getComponentProps('separator'),
})

// Utils
const mergedProps = computed(() => getComponentMergedProps('separator', props))

// Styles
const containerClass = computed(() => {
  return mergedProps.value?.ui?.containerClass?.({
    defaults: SEPARATOR_DEFAULT_PROPS.ui.containerClass(),
  })
})

const containerStyle = computed(() => {
  return mergedProps.value?.ui?.containerStyle?.()
})
</script>

<template>
  <span
    class="separator group/separator"
    :class="[
      props.vertical ? 'is-vertical' : 'is-horizontal',
      {
        'is-spaced': props.spaced,
        'is-inset': props.inset,
      },
      containerClass,
    ]"
    :style="containerStyle"
  >
    <slot>
      &#8203;
    </slot>
  </span>
</template>
