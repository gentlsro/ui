<script setup lang="ts">
// Types
import type { IItemProps } from './types/item-props.type'

// Constants
import { ITEM_LAYERED_CLASSES } from './constants/item-layered-classes.constant'

const props = withDefaults(defineProps<IItemProps>(), {
  ...getComponentProps('item'),
})

const mergedProps = computed(() => getComponentMergedProps('item', props))

// Styles - container
const containerClass = computed(() => {
  return mergedProps.value?.ui?.containerClass?.({
    defaults: ITEM_LAYERED_CLASSES.containerClass(),
  })
})

const containerStyle = computed(() => {
  return mergedProps.value?.ui?.containerStyle?.()
})

// Styles - focus helper
const focusHelperClass = computed(() => {
  return mergedProps.value?.ui?.focusHelperClass?.({
    defaults: ITEM_LAYERED_CLASSES.focusHelperClass(),
  })
})

const focusHelperStyle = computed(() => {
  return mergedProps.value?.ui?.focusHelperStyle?.()
})
</script>

<template>
  <Component
    :is="tag"
    class="item group/item"
    :class="[
      { 'is-readonly': readonly, 'is-disabled': disabled },
      containerClass,
    ]"
    :style="containerStyle"
  >
    <slot />

    <!-- Hover focus helper -->
    <span
      v-if="!noHoverEffect && !readonly && !disabled"
      class="focus-helper"
      :class="focusHelperClass"
      :style="focusHelperStyle"
      tabindex="-1"
    />
  </Component>
</template>
