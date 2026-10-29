<script setup lang="ts">
// Types
import type { IBadgeProps } from './types/badge-props.type'

// Constants
import { BADGE_LAYERED_CLASSES } from './constants/badge-layered-classes.constant'

const props = withDefaults(defineProps<IBadgeProps>(), {
  ...getComponentProps('badge'),
})

// Utils
const mergedProps = computed(() => {
  return getComponentMergedProps('badge', props)
})

// Styles - container
const containerClass = computed(() => {
  return mergedProps.value?.ui?.containerClass?.({
    defaults: BADGE_LAYERED_CLASSES.containerClass(),
  })
})

const containerStyle = computed(() => {
  return mergedProps.value?.ui?.containerStyle?.()
})
</script>

<template>
  <div
    class="badge"
    :class="containerClass"
    :style="containerStyle"
  >
    <slot>
      {{ counter }}
    </slot>
  </div>
</template>
