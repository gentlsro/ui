<script setup lang="ts" vapor>
import type { Day } from '../../../Utilities/app/models/day.model'

defineProps<{ day: Day, disabled?: boolean }>()
</script>

<template>
  <button
    type="button"
    :disabled
    :data-date="day.dateString"
  >
    {{ day.dateString }}
  </button>
</template>
