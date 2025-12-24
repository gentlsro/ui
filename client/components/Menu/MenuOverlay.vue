<script setup lang="ts">
// Types
import type { IMenuProps } from './types/menu-props.type'

// Store
import { useMenuStore } from './store/menu.store'

type IProps = {
  transitionDuration?: number
  ui?: IMenuProps['ui']
}

const props = defineProps<IProps>()

// Store
const { zIndex, model } = useMenuStore()

// Template
const menuOverlayStyle = computed(() => {
  return {
    ...props.ui?.overlayStyle,
    '--transitionDuration': `${props.transitionDuration ?? 180}ms`,
    '--zIndex': zIndex.value,
  }
})
</script>

<template>
  <div
    class="menu-overlay"
    :style="menuOverlayStyle"
    :class="ui?.overlayClass"
  />
</template>

<style lang="scss" scoped>
.menu-overlay {
  @apply z-$zIndex;
}
</style>
