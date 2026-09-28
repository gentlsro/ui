<script setup lang="ts" vapor>
const props = defineProps<{ name: string }>()

// Canonical Iconify names (`lucide:home`) use their UnoCSS icon class, since
// icons render natively instead of through the @nuxt/icon VDOM component
const iconClass = computed(() => {
  return !props.name.startsWith('i-') && props.name.includes(':')
    ? `i-${props.name}`
    : props.name
})
</script>

<template>
  <span
    :class="iconClass"
    aria-hidden="true"
  />
</template>
