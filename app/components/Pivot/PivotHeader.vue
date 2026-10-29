<script setup lang="ts">
// Store
import { usePivotStore } from './stores/pivot.store'

// Constants
import { PIVOT_LAYERED_CLASSES } from './constants/pivot-layered-classes.constant'

const { rows, visibleValueColumns, ui } = usePivotStore()

const headerClass = computed(() => {
  return ui.value?.headerClass?.({
    defaults: PIVOT_LAYERED_CLASSES.headerClass(),
  })
})

const headerStyle = computed(() => {
  return ui.value?.headerStyle?.()
})
</script>

<template>
  <div
    v-if="rows.length"
    class="pivot-header"
    :class="headerClass"
    :style="headerStyle"
  >
    <PivotRowHeader />
    <PivotValueHeader v-if="visibleValueColumns.length" />
  </div>
</template>
