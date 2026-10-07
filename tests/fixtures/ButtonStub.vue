<script setup lang="ts" vapor>
defineProps<{ label?: string, disabled?: boolean }>()
</script>

<template>
  <button
    type="button"
    :disabled
  >
    {{ label }}
  </button>
</template>
