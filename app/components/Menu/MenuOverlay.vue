<script setup lang="ts">
// Types
import type { IMenuProps } from './types/menu-props.type'

// Constants
import { MENU_DEFAULT_PROPS } from './constants/menu-default-props.constant'

// Store
import { useMenuStore } from './store/menu.store'

type IProps = {
  transitionDuration?: number
  ui?: IMenuProps['ui']
}

const props = defineProps<IProps>()

// Store
const { zIndex, model } = useMenuStore()

// Styles - overlay
const overlayClass = computed(() => {
  return props.ui?.overlayClass?.({
    defaults: MENU_DEFAULT_PROPS.ui.overlayClass(),
  })
})

const overlayStyle = computed(() => {
  return {
    ...props.ui?.overlayStyle?.(),
    '--transitionDuration': `${props.transitionDuration ?? 180}ms`,
    '--zIndex': zIndex.value,
  }
})
</script>

<template>
  <!-- The `floating-overlay` class marks the overlay as a part of the floating
  UI layer, which consumes the clicks in the layers below -->
  <div
    class="menu-overlay floating-overlay"
    :style="overlayStyle"
    :class="[overlayClass, { 'is-active': model }]"
  />
</template>

<style lang="scss" scoped>
.menu-overlay {
  @apply z-$zIndex;
}
</style>
