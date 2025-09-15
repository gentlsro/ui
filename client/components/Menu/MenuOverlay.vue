<script setup lang="ts">
type IProps = {
  transitionDuration?: number
}

const props = defineProps<IProps>()

// Store
import { useMenuStore } from './store/menu.store'

// Store
const { zIndex, model } = useMenuStore()

// Template
const menuOverlayStyle = computed(() => {
  return {
    '--transitionDuration': `${props.transitionDuration ?? 180}ms`,
    '--zIndex': zIndex.value,
  }
})

const menuOverlayClass = computed(() => {
  return { 'is-open': model.value }
})
</script>

<template>
  <div
    class="menu-overlay"
    :style="menuOverlayStyle"
    :class="menuOverlayClass"
  />
</template>

<style scoped>
.menu-overlay {
  @apply fixed inset-0 transition-background-color z-$zIndex
    duration-$transitionDuration ease bg-transparent;
}

.menu-overlay.is-open {
  @apply bg-darker/70;
}
</style>
