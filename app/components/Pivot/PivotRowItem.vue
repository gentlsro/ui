<script setup lang="ts" generic="T extends IItem = IItem">
// Types
import type { IPivotRowItem } from './types/pivot-row-item.type'
import type { IPivotDataItem } from './types/pivot-data-item.type'

// Store
import { usePivotStore } from './stores/pivot.store'
import { getPivotPromotedRowLabelLevels } from './functions/pivot-group-collapse'

// Constants
import { PIVOT_DEFAULT_PROPS } from './constants/pivot-default-props.constant'

type IProps = {
  row: IPivotDataItem<T>
  rowIndex: number
}

const props = defineProps<IProps>()

const { ui, state, rows, visibleData } = usePivotStore()

const promotedLevels = computed(() => {
  return getPivotPromotedRowLabelLevels({
    row: props.row,
    visibleRows: visibleData.value as IPivotDataItem<T>[],
    rowIndex: props.rowIndex,
    collapsedGroupIds: state.value.collapsedGroupIds,
    rowFieldCount: rows.value.length,
  })
})

// Styles - row item
const rowItemClass = computed(() => {
  return [
    ui.value?.rowItemClass?.({
      defaults: PIVOT_DEFAULT_PROPS.ui.rowItemClass(),
    }),
    {
      'is-subtotal': props.row.rowItem.kind === 'subtotal',
      'is-grand-total': props.row.rowItem.kind === 'grandTotal',
      'is-empty-row': props.row.rowItem.kind === 'emptyRow',
    },
  ]
})

const rowItemStyle = computed(() => {
  return ui.value?.rowItemStyle?.()
})
</script>

<template>
  <div
    class="pivot-row-item"
    :class="rowItemClass"
    :style="rowItemStyle"
  >
    <PivotRowItemCell
      v-for="cell in row.rowItem.cells"
      :key="cell.id"
      :item="cell"
      :group-ids="row.groupIds"
      :group-path="row.groupPath"
      :promoted-levels="promotedLevels"
    />
  </div>
</template>
