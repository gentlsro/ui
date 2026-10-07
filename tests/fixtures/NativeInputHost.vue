<script setup lang="ts" vapor>
import type { VaporComponent } from 'vue'

defineProps<{
  component: VaporComponent
  inputProps: Record<string, unknown>
}>()
</script>

<template>
  <Component
    :is="component"
    v-bind="inputProps"
  />
</template>
