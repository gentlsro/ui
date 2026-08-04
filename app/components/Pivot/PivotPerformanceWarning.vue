<script setup lang="ts">
// Store
import { usePivotStore } from './stores/pivot.store'

const {
  performanceWarning,
  continueTransform,
  cancelTransform,
} = usePivotStore()

const { formatNumber } = useNumber()

const warningDetails = computed(() => {
  const estimate = performanceWarning.value

  if (!estimate) {
    return ''
  }

  return $t('pivot.performanceWarningDetails', {
    sourceRows: formatNumber(estimate.sourceRowCount),
    rows: formatNumber(estimate.projectedRowCount),
    columns: formatNumber(estimate.valueColumnCount),
    cells: formatNumber(estimate.logicalCellCount),
  })
})
</script>

<template>
  <div
    v-if="performanceWarning"
    class="pivot-performance-warning"
  >
    <Banner
      variant="warning"
      outlined
      :ui="{
        containerClass: ({ defaults }) => `${defaults.all} max-w-120 shadow-lg`,
      }"
    >
      <div flex="~ col gap-3">
        <div flex="~ col gap-1">
          <strong>{{ $t('pivot.performanceWarning') }}</strong>
          <span>{{ warningDetails }}</span>
        </div>

        <div flex="~ gap-2 justify-end">
          <Btn
            size="sm"
            color="ca"
            no-uppercase
            :label="$t('pivot.returnToConfiguration')"
            @click.stop="cancelTransform"
          />

          <Btn
            size="sm"
            color="primary"
            no-uppercase
            :label="$t('pivot.runAnyway')"
            @click.stop="continueTransform"
          />
        </div>
      </div>
    </Banner>
  </div>
</template>

<style scoped lang="scss">
.pivot-performance-warning {
  @apply absolute inset-0 z-20 flex items-center justify-center bg-white/70 p-4 backdrop-blur-sm dark:bg-black/70;
}
</style>
