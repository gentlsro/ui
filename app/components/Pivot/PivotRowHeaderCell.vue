<script setup lang="ts" generic="T extends IItem = IItem">
// Models
import type { PivotRow } from './models/pivot-row.model'

// Constants
import { PIVOT_DEFAULT_PROPS } from './constants/pivot-default-props.constant'

// Store
import { usePivotStore } from './stores/pivot.store'

type IProps = {
  row: PivotRow<T>
}

const props = defineProps<IProps>()

const { ui } = usePivotStore()

const rowHeaderCellClass = computed(() => {
  return ui.value?.rowHeaderCellClass?.({
    defaults: PIVOT_DEFAULT_PROPS.ui.rowHeaderCellClass(),
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
    :title="row._label"
  >
    <span class="min-w-0 truncate">
      {{ row._label }}
    </span>
  </div>
</template>
