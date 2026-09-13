<script setup lang="ts" vapor>
defineProps<{ name: string }>()
</script>

<template>
  <span
    :class="name"
    aria-hidden="true"
  />
</template>
