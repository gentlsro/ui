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
  <div
    class="menu-overlay"
    :style="overlayStyle"
    :class="overlayClass"
  />
</template>

<style lang="scss" scoped>
.menu-overlay {
  @apply z-$zIndex;
}
</style>
