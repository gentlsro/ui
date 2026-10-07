<script setup lang="ts" vapor>
// Isolate input editing from layout and overlays, as the original tests did.
</script>

<template>
  <div>
    <slot
      :input-class="undefined"
      :input-style="undefined"
    />
  </div>
</template>
