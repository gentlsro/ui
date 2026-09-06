<script setup lang="ts" vapor>
defineOptions({ name: 'TabPanel' })
</script>

<template>
  <div class="tab">
    <slot />
  </div>
</template>
