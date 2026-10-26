<script setup lang="ts" vapor>
import { useRuntimeIcon } from './composables/useRuntimeIcon'

const props = defineProps<{ name: string }>()
const { canonical, icon } = useRuntimeIcon(() => props.name)
// Preserve UnoCSS/custom class behavior, including build-time hashed assets.
const iconClass = computed(() => {
  return canonical.value ? `i-${canonical.value}` : props.name
})
const iconStyle = computed(() => icon.value?.status === 'ready'
  ? {
      '--ui-icon': `url("${icon.value.url}")`,
    }
  : undefined)
</script>

<template>
  <span
    :class="iconClass"
    :style="iconStyle"
    :data-icon="canonical"
    :data-icon-status="icon?.status"
    :data-icon-mode="icon?.status === 'ready' ? icon.mode : undefined"
    aria-hidden="true"
  />
</template>

<style scoped>
/* Utility/UI overrides keep priority over the fallback dimensions. */
@layer ui-runtime-icons {
  [data-icon-mode] {
    display: inline-block;
    width: 1.2rem;
    height: 1.2rem;
    vertical-align: middle;
  }
}
[data-icon-mode='mask'] {
  background-color: currentColor;
  -webkit-mask: var(--ui-icon) no-repeat center / 100% 100%;
  mask: var(--ui-icon) no-repeat center / 100% 100%;
}
[data-icon-mode='background'] {
  background: var(--ui-icon) no-repeat center / 100% 100%;
}
</style>
