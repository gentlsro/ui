<script setup lang="ts">
const d = ref('2025-01-01')
const dur = ref(2)
</script>

<template>
  <div>
    <div
      flex="~ col"
      w="100"
    >
      <DateInput v-model="d" />
      <DurationInput v-model="dur" />

      <div class="i-custom:erb h-10 w-10" />
    </div>
  </div>
</template>
