<script setup lang="ts" generic="T extends IItem = IItem">
// Models
import type { PivotItem } from './models/pivot-item.model'

// Constants
import { PIVOT_LAYERED_CLASSES } from './constants/pivot-layered-classes.constant'

// Store
import { usePivotStore } from './stores/pivot.store'

type IProps = {
  row: PivotItem<T>
  isMeasureColumn?: boolean
}

const props = defineProps<IProps>()

const { ui } = usePivotStore()

const headerLabel = computed(() => {
  if (props.isMeasureColumn) {
    return $t('pivot.measureField')
  }

  return props.row._label
})

const rowHeaderCellClass = computed(() => {
  return ui.value?.rowHeaderCellClass?.({
    defaults: PIVOT_LAYERED_CLASSES.rowHeaderCellClass(),
  })
})

const rowHeaderCellStyle = computed(() => {
  const rowHeaderCellStyle = ui.value?.rowHeaderCellStyle?.()
  const width = props.row.widthResolved

  return Object.assign({}, rowHeaderCellStyle, { width })
})
</script>

<template>
  <div
    class="pivot-row-header-cell"
    :class="rowHeaderCellClass"
    :style="rowHeaderCellStyle"
    :data-pivot-row="String(row.field)"
    :title="headerLabel"
  >
    <span class="truncate grow">
      {{ headerLabel }}
    </span>

    <!-- Filter -->
    <PivotFilterBtn
      v-if="!isMeasureColumn"
      :item="row"
      size="auto"
    />
  </div>
</template>
