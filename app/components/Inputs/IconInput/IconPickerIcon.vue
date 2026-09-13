<script setup lang="ts" vapor>
withDefaults(defineProps<{ name: string, size?: number }>(), { size: 28 })
</script>

<template>
  <span
    :class="name"
    :style="{ width: `${size}px`, height: `${size}px` }"
    aria-hidden="true"
  />
</template>
